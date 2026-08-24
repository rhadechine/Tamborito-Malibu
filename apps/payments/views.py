import logging
from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.http import Http404
from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from apps.commerce.models import Order
from apps.donations.models import Donation
from apps.learning import services as learning_services
from common.events import dispatch
from common.permissions import IsSuperAdmin
from common.responses.envelope import error, success
from common.schema import PaymentStatusResponseSerializer
from infrastructure.payments import payu

from .models import PaymentEvent, PaymentIntent
from .serializers import CreatePaymentIntentSerializer, PaymentIntentSerializer

logger = logging.getLogger("tamborito.payments")

# Máquina de estados de un intent (sección 19). Un pago aprobado solo puede
# avanzar a reembolsado; los estados finales no vuelven atrás. Sin esto, una
# confirmación tardía con `state_pol=7` degradaba un pago ya aprobado a
# "pending" y dejaba la orden en un estado incoherente.
_ALLOWED_TRANSITIONS = {
    PaymentIntent.Status.PENDING: {
        PaymentIntent.Status.APPROVED,
        PaymentIntent.Status.REJECTED,
        PaymentIntent.Status.EXPIRED,
        PaymentIntent.Status.PENDING_REVIEW,
        PaymentIntent.Status.PENDING,
    },
    PaymentIntent.Status.PENDING_REVIEW: {
        PaymentIntent.Status.APPROVED,
        PaymentIntent.Status.REJECTED,
        PaymentIntent.Status.EXPIRED,
        PaymentIntent.Status.PENDING_REVIEW,
    },
    PaymentIntent.Status.APPROVED: {PaymentIntent.Status.REFUNDED},
    PaymentIntent.Status.REJECTED: set(),
    PaymentIntent.Status.EXPIRED: set(),
    PaymentIntent.Status.REFUNDED: set(),
}

# --- Creación / consulta de intents ---


@extend_schema(request=CreatePaymentIntentSerializer, responses={201: PaymentIntentSerializer})
class PaymentIntentCreateView(APIView):
    # AllowAny: una donación puede pagarse sin haber iniciado sesión (sección 20).
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CreatePaymentIntentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if data.get("order_id"):
            order_qs = Order.objects.all() if request.user.is_authenticated else Order.objects.none()
            order = get_object_or_404(order_qs, pk=data["order_id"], user=request.user)
            if order.payment_status != Order.PaymentStatus.PENDING:
                return error("BAD_REQUEST", "La orden ya no admite un nuevo intento de pago.")
            target = {"order": order, "amount": order.total, "currency": order.currency}
        else:
            donation = get_object_or_404(Donation, pk=data["donation_id"])
            if donation.status != Donation.Status.PENDING:
                return error("BAD_REQUEST", "La donación ya no admite un nuevo intento de pago.")
            target = {"donation": donation, "amount": donation.amount, "currency": donation.currency}

        user = request.user if request.user.is_authenticated else None
        intent = PaymentIntent.objects.create(user=user, **target)

        checkout = payu.build_checkout_payload(intent)
        intent.redirect_url = checkout["action_url"]
        intent.save(update_fields=["redirect_url"])

        return success(PaymentIntentSerializer(intent, context={"checkout": checkout}).data, status=201)


class PaymentIntentDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentIntentSerializer

    def get_queryset(self):
        # Solo el super_admin ve los intents de terceros; el resto, los suyos.
        if self.request.user.is_authenticated and self.request.user.is_super_admin:
            return PaymentIntent.objects.all()
        return PaymentIntent.objects.filter(user=self.request.user)


# --- Webhook (única fuente de verdad de aprobación — sección 19) ---


@extend_schema(
    request=OpenApiTypes.OBJECT,
    responses={200: PaymentStatusResponseSerializer},
    description=(
        "Confirmación server-to-server del proveedor. El cuerpo lo define "
        "PayU (reference_sale, value, currency, state_pol, transaction_id, sign). "
        "Única fuente de verdad de la aprobación de un pago (sección 19)."
    ),
)
class PaymentWebhookView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "webhook"

    def post(self, request, provider):
        if provider != PaymentIntent.Provider.PAYU:
            raise Http404

        data = request.data
        if not payu.verify_webhook_signature(data):
            return error("BAD_REQUEST", "Firma inválida.", status=400)

        transaction_id = str(data.get("transaction_id") or "")
        if not transaction_id:
            # `provider_event_id` es la clave de idempotencia (sección 46): sin
            # él, dos eventos distintos colisionan como "" y el segundo se
            # descartaría como duplicado.
            return error("BAD_REQUEST", "Falta 'transaction_id' en la confirmación.")

        # Toda la confirmación es una sola transacción: si la propagación falla
        # (p. ej. al inscribir al estudiante), el PaymentEvent tampoco queda
        # escrito y el reintento de PayU vuelve a procesarla. Antes el evento se
        # guardaba primero y el reintento respondía "ya procesado": el usuario
        # pagaba y nunca se inscribía. `select_for_update` además serializa las
        # confirmaciones concurrentes sobre el mismo intent.
        with transaction.atomic():
            intent = get_object_or_404(
                PaymentIntent.objects.select_for_update(),
                reference_code=data.get("reference_sale"),
            )

            mismatch = self._amount_mismatch(intent, data)
            if mismatch:
                logger.warning(
                    "payu_confirmation_amount_mismatch",
                    extra={"reference_sale": intent.reference_code, "detail": mismatch},
                )
                return error("BAD_REQUEST", mismatch)

            _event, created = PaymentEvent.objects.get_or_create(
                payment_intent=intent,
                provider_event_id=transaction_id,
                defaults={"event_type": str(data.get("state_pol", "")), "payload_json": dict(data)},
            )
            if not created:
                # Idempotencia (sección 46): este evento ya fue procesado.
                return success({"status": intent.status})

            new_status = payu.STATE_MAP.get(
                str(data.get("state_pol")), PaymentIntent.Status.PENDING_REVIEW
            )
            if new_status not in _ALLOWED_TRANSITIONS.get(intent.status, set()):
                logger.warning(
                    "payu_confirmation_ignored_invalid_transition",
                    extra={
                        "reference_sale": intent.reference_code,
                        "from_status": intent.status,
                        "to_status": new_status,
                    },
                )
                # El evento queda registrado para trazabilidad, pero no se
                # aplica: un pago aprobado no vuelve a "pending".
                return success({"status": intent.status})

            intent.status = new_status
            intent.provider_reference = transaction_id
            intent.method = data.get("payment_method_type", intent.method)
            intent.save(update_fields=["status", "provider_reference", "method", "updated_at"])

            self._propagate(intent)

        return success({"status": intent.status})

    @staticmethod
    def _amount_mismatch(intent, data):
        """La confirmación debe pagar exactamente lo que dice el intent.

        La firma garantiza que PayU emitió estos valores, pero no que
        correspondan a lo que se cobró: sin esta comprobación una confirmación
        legítima por otro importe marcaría la orden como pagada igual.
        """
        try:
            paid = Decimal(str(data.get("value", "0")))
        except (InvalidOperation, ValueError, TypeError):
            return "El valor de la confirmación no es un número válido."

        cents = Decimal("0.01")
        if paid.quantize(cents) != intent.amount.quantize(cents):
            return f"El monto confirmado ({paid}) no coincide con el del intent ({intent.amount})."

        currency = str(data.get("currency", "")).upper()
        if currency != intent.currency.upper():
            return f"La moneda confirmada ({currency}) no coincide con la del intent ({intent.currency})."

        return None

    @staticmethod
    def _propagate(intent):
        if intent.order_id:
            order = intent.order
            order.transaction_reference = intent.provider_reference
            if intent.status == PaymentIntent.Status.APPROVED:
                order.payment_status = Order.PaymentStatus.PAID
                order.order_status = Order.OrderStatus.COMPLETED
            elif intent.status in (PaymentIntent.Status.REJECTED, PaymentIntent.Status.EXPIRED):
                order.payment_status = Order.PaymentStatus.FAILED
            order.save(update_fields=["payment_status", "order_status", "transaction_reference", "updated_at"])
            if intent.status == PaymentIntent.Status.APPROVED:
                # sección 17: curso pago -> payment.approved -> Enrollment.
                learning_services.enroll_from_order(order)
                dispatch("payment.approved", order=order)
        elif intent.donation_id:
            donation = intent.donation
            donation.transaction_reference = intent.provider_reference
            if intent.status == PaymentIntent.Status.APPROVED:
                donation.status = Donation.Status.APPROVED
            elif intent.status in (PaymentIntent.Status.REJECTED, PaymentIntent.Status.EXPIRED):
                donation.status = Donation.Status.REJECTED
            donation.save()
            if intent.status == PaymentIntent.Status.APPROVED:
                dispatch("donation.approved", donation=donation)


@extend_schema(request=None, responses={200: PaymentStatusResponseSerializer})
class AdminPaymentRefundView(APIView):
    """Reembolso de un pago ya aprobado (secciones 19/28: evento payment.refunded).

    Alcance: solo pagos de órdenes (Commerce). El documento no define un flujo
    de reembolso de donaciones, así que no se inventó uno aquí.
    """

    permission_classes = [IsSuperAdmin]

    def post(self, request, pk):
        intent = get_object_or_404(PaymentIntent, pk=pk)
        if intent.status != PaymentIntent.Status.APPROVED:
            return error("BAD_REQUEST", "Solo un pago aprobado puede reembolsarse.")
        if not intent.order_id:
            return error("BAD_REQUEST", "Solo se pueden reembolsar pagos de órdenes.")

        approved_event = intent.events.filter(event_type="4").order_by("-received_at").first()
        payu_order_id = approved_event.payload_json.get("reference_pol") if approved_event else None
        if not payu_order_id:
            return error("BAD_REQUEST", "No se encontró la referencia de PayU de este pago.")

        try:
            result = payu.request_refund(payu_order_id, intent.provider_reference)
        except payu.PayURefundError as exc:
            return error("BAD_REQUEST", str(exc), status=502)

        # Idempotencia (sección 46): si el admin repite la solicitud, no se
        # vuelve a marcar la orden ni a disparar el evento dos veces.
        _event, created = PaymentEvent.objects.get_or_create(
            payment_intent=intent,
            provider_event_id=result["transaction_id"],
            defaults={"event_type": "REFUND", "payload_json": result},
        )
        if created:
            with transaction.atomic():
                intent.status = PaymentIntent.Status.REFUNDED
                intent.save(update_fields=["status", "updated_at"])

                order = intent.order
                order.payment_status = Order.PaymentStatus.REFUNDED
                order.save(update_fields=["payment_status", "updated_at"])

                # sección 17/19: devolver el dinero tiene que retirar también lo
                # que la compra habilitó. Antes el reembolso solo cambiaba
                # estados: la inscripción seguía activa, el acceso a Library
                # vigente y el certificado válido.
                learning_services.revoke_from_order(order)

                dispatch("payment.refunded", order=order)

        return success({"status": intent.status})


@extend_schema(responses={200: PaymentIntentSerializer})
class PaymentReturnView(APIView):
    """Redirección del comprador tras PayU. Nunca aprueba el pago (sección 19):
    solo refleja el estado ya decidido por el webhook."""

    permission_classes = [AllowAny]

    def get(self, request):
        reference_code = request.query_params.get("referenceCode")
        intent = get_object_or_404(PaymentIntent, reference_code=reference_code)
        return success(PaymentIntentSerializer(intent).data)
