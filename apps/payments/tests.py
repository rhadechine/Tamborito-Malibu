from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.commerce.models import Order, OrderItem
from apps.courses.models import Course
from apps.donations.models import Donation
from apps.identity.models import User
from apps.learning.models import Enrollment
from apps.payments.models import PaymentEvent, PaymentIntent
from infrastructure.payments import payu


@pytest.fixture(autouse=True)
def payu_credentials(settings):
    settings.PAYU_API_KEY = "test-api-key"
    settings.PAYU_MERCHANT_ID = "test-merchant"


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


def _webhook_body(intent, state_pol, transaction_id="tx-1", reference_pol="polref-1"):
    sign = payu._signature(intent.reference_code, intent.amount, intent.currency, state_pol)
    return {
        "merchant_id": "test-merchant",
        "reference_sale": intent.reference_code,
        "reference_pol": reference_pol,
        "value": str(intent.amount),
        "currency": intent.currency,
        "state_pol": state_pol,
        "transaction_id": transaction_id,
        "sign": sign,
    }


@pytest.mark.django_db
def test_create_intent_for_order_returns_signed_checkout_payload(student):
    Course.objects.create(slug="c1", title="C1", organization="museum", price="100.00")
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/payments/intents", {"order_id": order.id})

    assert resp.status_code == 201
    body = resp.data["data"]
    assert body["amount"] == "100.00"
    assert body["checkout"]["fields"]["referenceCode"] == body["reference_code"]
    assert body["checkout"]["fields"]["signature"]


@pytest.mark.django_db
def test_create_intent_requires_exactly_one_target(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/payments/intents", {})

    assert resp.status_code == 400


@pytest.mark.django_db
def test_anonymous_donor_can_create_a_payment_intent_for_a_donation():
    donation = Donation.objects.create(
        donor_name="Ana", donor_email="ana@example.com", organization_target="museum", amount="50000.00"
    )
    client = APIClient()

    resp = client.post("/api/v1/payments/intents", {"donation_id": donation.id})

    assert resp.status_code == 201


@pytest.mark.django_db
def test_webhook_approves_order_and_marks_it_paid(student):
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    client = APIClient()

    resp = client.post("/api/v1/payments/webhooks/payu", _webhook_body(intent, "4"))

    assert resp.status_code == 200
    intent.refresh_from_db()
    order.refresh_from_db()
    assert intent.status == "approved"
    assert order.payment_status == Order.PaymentStatus.PAID
    assert order.order_status == Order.OrderStatus.COMPLETED


@pytest.mark.django_db
def test_webhook_approves_order_and_enrolls_the_student_in_its_courses(student):
    course = Course.objects.create(slug="c-paid", title="C Paid", organization="museum", price="100.00")
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    client = APIClient()

    client.post("/api/v1/payments/webhooks/payu", _webhook_body(intent, "4"))

    assert Enrollment.objects.filter(user=student, course=course, source=Enrollment.Source.ORDER).exists()


@pytest.mark.django_db
def test_webhook_approves_donation_and_sets_confirmed_at():
    donation = Donation.objects.create(
        donor_name="Ana", donor_email="ana@example.com", organization_target="museum", amount="50000.00"
    )
    intent = PaymentIntent.objects.create(donation=donation, amount="50000.00")
    client = APIClient()

    client.post("/api/v1/payments/webhooks/payu", _webhook_body(intent, "4"))

    donation.refresh_from_db()
    assert donation.status == Donation.Status.APPROVED
    assert donation.confirmed_at is not None


@pytest.mark.django_db
def test_webhook_rejects_invalid_signature():
    donation = Donation.objects.create(
        donor_name="Ana", donor_email="ana@example.com", organization_target="museum", amount="50000.00"
    )
    intent = PaymentIntent.objects.create(donation=donation, amount="50000.00")
    body = _webhook_body(intent, "4")
    body["sign"] = "tampered"
    client = APIClient()

    resp = client.post("/api/v1/payments/webhooks/payu", body)

    assert resp.status_code == 400
    intent.refresh_from_db()
    assert intent.status == "pending"


@pytest.mark.django_db
def test_webhook_is_idempotent_for_the_same_transaction_id():
    donation = Donation.objects.create(
        donor_name="Ana", donor_email="ana@example.com", organization_target="museum", amount="50000.00"
    )
    intent = PaymentIntent.objects.create(donation=donation, amount="50000.00")
    client = APIClient()
    body = _webhook_body(intent, "4", transaction_id="tx-dup")

    client.post("/api/v1/payments/webhooks/payu", body)
    client.post("/api/v1/payments/webhooks/payu", body)

    assert PaymentEvent.objects.filter(payment_intent=intent).count() == 1


@pytest.fixture
def admin():
    return User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.SUPER_ADMIN
    )


def _approve_order_payment(student):
    Course.objects.create(slug=f"c-{PaymentIntent.objects.count()}", title="C", organization="museum", price="100.00")
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    APIClient().post("/api/v1/payments/webhooks/payu", _webhook_body(intent, "4"))
    intent.refresh_from_db()
    order.refresh_from_db()
    return intent, order


@pytest.mark.django_db
def test_admin_can_refund_an_approved_order_payment(student, admin, monkeypatch):
    intent, order = _approve_order_payment(student)
    monkeypatch.setattr(payu, "request_refund", lambda *a, **k: {"state": "APPROVED", "transaction_id": "refund-1"})
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    assert resp.status_code == 200
    assert resp.data["data"]["status"] == "refunded"
    intent.refresh_from_db()
    order.refresh_from_db()
    assert intent.status == "refunded"
    assert order.payment_status == Order.PaymentStatus.REFUNDED

    from apps.audit.models import AuditLog

    assert AuditLog.objects.filter(action="payment.refunded", entity_id=order.id).exists()


@pytest.mark.django_db
def test_refunding_twice_is_rejected_the_second_time(student, admin, monkeypatch):
    intent, _order = _approve_order_payment(student)
    monkeypatch.setattr(payu, "request_refund", lambda *a, **k: {"state": "APPROVED", "transaction_id": "refund-2"})
    client = APIClient()
    client.force_authenticate(admin)
    client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    resp = client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    assert resp.status_code == 400


@pytest.mark.django_db
def test_cannot_refund_a_payment_that_is_not_approved(student, admin):
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    assert resp.status_code == 400


@pytest.mark.django_db
def test_refund_returns_502_when_payu_declines_it(student, admin, monkeypatch):
    intent, order = _approve_order_payment(student)

    def _raise(*a, **k):
        raise payu.PayURefundError("PayU no aprobó el reembolso (state=DECLINED).")

    monkeypatch.setattr(payu, "request_refund", _raise)
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    assert resp.status_code == 502
    intent.refresh_from_db()
    order.refresh_from_db()
    assert intent.status == "approved"
    assert order.payment_status == Order.PaymentStatus.PAID


@pytest.mark.django_db
def test_non_admin_cannot_refund_a_payment(student):
    intent, _order = _approve_order_payment(student)
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    assert resp.status_code == 403


@pytest.mark.django_db
def test_return_view_reflects_db_status_not_query_params():
    donation = Donation.objects.create(
        donor_name="Ana", donor_email="ana@example.com", organization_target="museum", amount="50000.00"
    )
    intent = PaymentIntent.objects.create(donation=donation, amount="50000.00")
    client = APIClient()

    # el navegador podría mentir en la query string; el backend nunca confía en ella.
    resp = client.get(f"/api/v1/payments/return?referenceCode={intent.reference_code}&lapTransactionState=APPROVED")

    assert resp.data["data"]["status"] == "pending"


# ---------------------------------------------------------------------------
# Firma de la confirmación (sección 19). PayU firma el valor de la
# confirmación con un solo decimal cuando el segundo es cero; el formato de
# WebCheckout ("150000") no sirve aquí y hacía que ningún pago se aprobara.
# ---------------------------------------------------------------------------


def _sign_confirmation(reference_code, amount_text, currency, state_pol):
    from django.conf import settings as dj_settings

    from infrastructure.payments.payu import _md5

    return _md5(
        [
            dj_settings.PAYU_API_KEY,
            dj_settings.PAYU_MERCHANT_ID,
            reference_code,
            amount_text,
            currency,
            state_pol,
        ]
    )


@pytest.mark.parametrize(
    "value,signed_as",
    [
        ("50000.00", "50000.0"),  # formato documentado por PayU
        ("50000.00", "50000"),  # formato de WebCheckout, también aceptado
        ("150.50", "150.5"),
        ("150.55", "150.55"),
    ],
)
def test_confirmation_signature_accepts_payu_decimal_format(value, signed_as, settings):
    settings.PAYU_API_KEY = "test-api-key"
    settings.PAYU_MERCHANT_ID = "test-merchant"
    data = {
        "reference_sale": "REF123",
        "value": value,
        "currency": "COP",
        "state_pol": "4",
        "sign": _sign_confirmation("REF123", signed_as, "COP", "4"),
    }

    assert payu.verify_webhook_signature(data) is True


def test_confirmation_signature_is_case_insensitive(settings):
    settings.PAYU_API_KEY = "test-api-key"
    settings.PAYU_MERCHANT_ID = "test-merchant"
    data = {
        "reference_sale": "REF123",
        "value": "50000.00",
        "currency": "COP",
        "state_pol": "4",
        "sign": _sign_confirmation("REF123", "50000.0", "COP", "4").upper(),
    }

    assert payu.verify_webhook_signature(data) is True


def test_confirmation_signature_still_rejects_a_wrong_amount(settings):
    settings.PAYU_API_KEY = "test-api-key"
    settings.PAYU_MERCHANT_ID = "test-merchant"
    data = {
        "reference_sale": "REF123",
        "value": "50000.00",
        "currency": "COP",
        "state_pol": "4",
        # Firmado por otro importe: no debe validar.
        "sign": _sign_confirmation("REF123", "1.0", "COP", "4"),
    }

    assert payu.verify_webhook_signature(data) is False


def test_confirmation_signature_is_rejected_without_credentials(settings):
    settings.PAYU_API_KEY = ""
    settings.PAYU_MERCHANT_ID = ""
    data = {"reference_sale": "R", "value": "1.00", "currency": "COP", "state_pol": "4", "sign": "x"}

    assert payu.verify_webhook_signature(data) is False


@pytest.mark.django_db
def test_webhook_approves_a_payment_signed_with_payu_decimal_format(student):
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    body = {
        "reference_sale": intent.reference_code,
        "reference_pol": "polref-9",
        "value": "100.00",
        "currency": intent.currency,
        "state_pol": "4",
        "transaction_id": "tx-decimal",
        "sign": _sign_confirmation(intent.reference_code, "100.0", intent.currency, "4"),
    }

    resp = APIClient().post("/api/v1/payments/webhooks/payu", body)

    assert resp.status_code == 200
    order.refresh_from_db()
    assert order.payment_status == Order.PaymentStatus.PAID


# ---------------------------------------------------------------------------
# Atomicidad, validación de monto y máquina de estados del webhook
# (secciones 19 y 46).
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_webhook_rejects_a_confirmation_for_a_different_amount(student):
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    body = _webhook_body(intent, "4")
    # PayU firmó legítimamente otro importe: la firma valida, el monto no.
    body["value"] = "1.00"
    body["sign"] = payu._signature(intent.reference_code, Decimal("1.00"), intent.currency, "4")

    resp = APIClient().post("/api/v1/payments/webhooks/payu", body)

    assert resp.status_code == 400
    order.refresh_from_db()
    assert order.payment_status == Order.PaymentStatus.PENDING
    assert PaymentEvent.objects.count() == 0


@pytest.mark.django_db
def test_webhook_rejects_a_confirmation_in_another_currency(student):
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    body = _webhook_body(intent, "4")
    body["currency"] = "USD"
    body["sign"] = payu._signature(intent.reference_code, intent.amount, "USD", "4")

    resp = APIClient().post("/api/v1/payments/webhooks/payu", body)

    assert resp.status_code == 400
    intent.refresh_from_db()
    assert intent.status == PaymentIntent.Status.PENDING


@pytest.mark.django_db
def test_webhook_without_transaction_id_is_rejected(student):
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    body = _webhook_body(intent, "4", transaction_id="")

    resp = APIClient().post("/api/v1/payments/webhooks/payu", body)

    assert resp.status_code == 400
    assert PaymentEvent.objects.count() == 0


@pytest.mark.django_db
def test_an_approved_payment_is_not_downgraded_by_a_later_pending_confirmation(student):
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    client = APIClient()
    client.post("/api/v1/payments/webhooks/payu", _webhook_body(intent, "4", transaction_id="tx-a"))

    # Confirmación tardía "pending" con otro transaction_id: no debe degradar nada.
    resp = client.post(
        "/api/v1/payments/webhooks/payu", _webhook_body(intent, "7", transaction_id="tx-b")
    )

    assert resp.status_code == 200
    intent.refresh_from_db()
    order.refresh_from_db()
    assert intent.status == PaymentIntent.Status.APPROVED
    assert order.payment_status == Order.PaymentStatus.PAID
    # El evento igual queda registrado para trazabilidad.
    assert PaymentEvent.objects.filter(payment_intent=intent).count() == 2


@pytest.mark.django_db
def test_a_failed_propagation_rolls_back_the_whole_confirmation(student, monkeypatch):
    # Si la inscripción falla, el PaymentEvent no debe quedar escrito: de lo
    # contrario el reintento de PayU responde "ya procesado" y el estudiante
    # termina pagando sin quedar inscrito.
    from apps.payments import views as payment_views

    course = Course.objects.create(slug="c-rollback", title="C", organization="museum", price="100.00")
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")

    def _boom(*a, **k):
        raise RuntimeError("fallo al inscribir")

    monkeypatch.setattr(payment_views.learning_services, "enroll_from_order", _boom)

    with pytest.raises(RuntimeError):
        APIClient().post("/api/v1/payments/webhooks/payu", _webhook_body(intent, "4"))

    intent.refresh_from_db()
    order.refresh_from_db()
    assert PaymentEvent.objects.filter(payment_intent=intent).count() == 0
    assert intent.status == PaymentIntent.Status.PENDING
    assert order.payment_status == Order.PaymentStatus.PENDING


# ---------------------------------------------------------------------------
# El reembolso retira lo que la compra habilitó (secciones 17/19).
# ---------------------------------------------------------------------------


def _buy_and_approve(student, slug, certificate_enabled=False):
    course = Course.objects.create(
        slug=slug, title=slug, organization="museum", price="100.00",
        certificate_enabled=certificate_enabled,
    )
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="100.00")
    intent = PaymentIntent.objects.create(order=order, user=student, amount="100.00")
    APIClient().post("/api/v1/payments/webhooks/payu", _webhook_body(intent, "4"))
    intent.refresh_from_db()
    order.refresh_from_db()
    return course, order, intent


@pytest.mark.django_db
def test_refund_cancels_the_enrollment_and_library_access(student, admin, monkeypatch):
    from apps.library.models import CourseAccessGrant

    course, _order, intent = _buy_and_approve(student, "c-refund-1")
    assert Enrollment.objects.get(user=student, course=course).status == Enrollment.Status.ACTIVE
    assert CourseAccessGrant.objects.filter(user=student, course=course).exists()

    monkeypatch.setattr(payu, "request_refund", lambda *a, **k: {"state": "APPROVED", "transaction_id": "r-1"})
    client = APIClient()
    client.force_authenticate(admin)
    resp = client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    assert resp.status_code == 200
    assert Enrollment.objects.get(user=student, course=course).status == Enrollment.Status.CANCELLED
    assert not CourseAccessGrant.objects.filter(user=student, course=course).exists()


@pytest.mark.django_db
def test_a_cancelled_enrollment_no_longer_opens_the_course(student, admin, monkeypatch):
    course, _order, intent = _buy_and_approve(student, "c-refund-4")
    client = APIClient()
    client.force_authenticate(student)
    assert client.get(f"/api/v1/student/courses/{course.id}").status_code == 200

    monkeypatch.setattr(payu, "request_refund", lambda *a, **k: {"state": "APPROVED", "transaction_id": "r-4"})
    admin_client = APIClient()
    admin_client.force_authenticate(admin)
    admin_client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    assert client.get(f"/api/v1/student/courses/{course.id}").status_code == 404


@pytest.mark.django_db
def test_refund_revokes_the_certificate(student, admin, monkeypatch):
    from apps.certificates.models import Certificate

    course, _order, intent = _buy_and_approve(student, "c-refund-2", certificate_enabled=True)
    certificate = Certificate.objects.create(user=student, course=course)
    assert certificate.revoked_at is None

    monkeypatch.setattr(payu, "request_refund", lambda *a, **k: {"state": "APPROVED", "transaction_id": "r-2"})
    client = APIClient()
    client.force_authenticate(admin)
    client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    certificate.refresh_from_db()
    assert certificate.revoked_at is not None
    # La verificación pública responde "existe pero ya no es válido".
    verify = APIClient().get(f"/api/v1/certificates/verify/{certificate.code}")
    assert verify.status_code == 200
    assert verify.data["data"]["valid"] is False


@pytest.mark.django_db
def test_refund_does_not_revoke_an_enrollment_the_user_had_by_another_route(student, admin, monkeypatch):
    # Si el usuario ya tenía el curso por alta manual, el reembolso solo debe
    # quitarle la condición de comprador, no la inscripción.
    from apps.library.models import CourseAccessGrant

    course, _order, intent = _buy_and_approve(student, "c-refund-3")
    enrollment = Enrollment.objects.get(user=student, course=course)
    enrollment.source = Enrollment.Source.ADMIN
    enrollment.save(update_fields=["source"])

    monkeypatch.setattr(payu, "request_refund", lambda *a, **k: {"state": "APPROVED", "transaction_id": "r-3"})
    client = APIClient()
    client.force_authenticate(admin)
    client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund")

    enrollment.refresh_from_db()
    assert enrollment.status == Enrollment.Status.ACTIVE
    grant = CourseAccessGrant.objects.get(user=student, course=course)
    assert grant.via_purchase is False
