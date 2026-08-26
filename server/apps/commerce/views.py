from decimal import Decimal

from django.db import transaction
from django.shortcuts import get_object_or_404
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import Course
from apps.learning import services as learning_services
from common.events import dispatch
from common.permissions import IsSuperAdmin
from common.responses.envelope import error, success

from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    AddCartItemSerializer,
    CartSerializer,
    OrderAdminUpdateSerializer,
    OrderSerializer,
)

# --- Carrito ---


@extend_schema(
    responses={
        200: CartSerializer,
        204: OpenApiResponse(description="Carrito vaciado."),
    }
)
class CartView(APIView):
    def get(self, request):
        cart = Cart.objects.active_for(request.user)
        return success(CartSerializer(cart).data)

    def delete(self, request):
        cart = Cart.objects.active_for(request.user)
        cart.items.all().delete()
        return Response(status=204)


@extend_schema(request=AddCartItemSerializer, responses={201: CartSerializer})
class CartItemsView(APIView):
    def post(self, request):
        serializer = AddCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # `status=PUBLISHED`: un curso en borrador o archivado no tiene por
        # qué ser comprable — la única vía legítima para conocer un course_id
        # es el catálogo público (`CourseListView`), que ya filtra por esto.
        course = get_object_or_404(
            Course, pk=serializer.validated_data["course_id"], status=Course.Status.PUBLISHED
        )
        if course.is_free:
            return error("BAD_REQUEST", "Este curso es gratuito: inscríbete directamente, no requiere compra.")
        if learning_services.has_active_enrollment(request.user, course):
            return error("BAD_REQUEST", "Ya tienes acceso a este curso.")

        cart = Cart.objects.active_for(request.user)
        _item, _created = CartItem.objects.update_or_create(
            cart=cart, course=course, defaults={"price_snapshot": course.price}
        )
        return success(CartSerializer(cart).data, status=201)


@extend_schema(responses={204: OpenApiResponse(description="Ítem retirado del carrito.")})
class CartItemDetailView(APIView):
    def delete(self, request, course_id):
        cart = Cart.objects.active_for(request.user)
        cart.items.filter(course_id=course_id).delete()
        return Response(status=204)


# --- Checkout ---


@extend_schema(request=None, responses={201: OrderSerializer})
class CheckoutView(APIView):
    def post(self, request):
        cart = Cart.objects.active_for(request.user)
        items = list(cart.items.select_related("course"))
        if not items:
            return error("BAD_REQUEST", "El carrito está vacío.")

        # Entre agregar al carrito y pagar puede pasar tiempo: un admin pudo
        # despublicar el curso, o el estudiante pudo obtener acceso por otra
        # vía (inscripción gratuita, alta manual) mientras tanto. Se
        # re-valida en vez de confiar en lo que quedó en el carrito.
        invalid_items = [
            item for item in items
            if item.course.status != Course.Status.PUBLISHED
            or learning_services.has_active_enrollment(request.user, item.course)
        ]
        if invalid_items:
            cart.items.filter(id__in=[item.id for item in invalid_items]).delete()
            titles = ", ".join(item.course.title for item in invalid_items)
            return error(
                "BAD_REQUEST",
                f"Estos cursos ya no se pueden comprar y se quitaron del carrito: {titles}.",
            )

        with transaction.atomic():
            subtotal = sum((i.price_snapshot for i in items), start=Decimal(0))
            order = Order.objects.create(user=request.user, subtotal=subtotal, total=subtotal)
            OrderItem.objects.bulk_create(
                OrderItem(
                    order=order,
                    course=i.course,
                    title_snapshot=i.course.title,
                    price_snapshot=i.price_snapshot,
                )
                for i in items
            )
            cart.status = Cart.Status.CHECKED_OUT
            cart.save(update_fields=["status"])

        dispatch("order.created", order=order)
        return success(OrderSerializer(order).data, status=201)


# --- Estudiante ---


class StudentOrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")


class StudentOrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


# --- Admin ---
#
# Las ordenes son informacion financiera del ecosistema completo: las
# administra el super_admin, no los admins por organizacion (seccion 39).


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer
    permission_classes = [IsSuperAdmin]


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    queryset = Order.objects.all()
    permission_classes = [IsSuperAdmin]
    http_method_names = ["get", "patch"]

    def get_serializer_class(self):
        return OrderAdminUpdateSerializer if self.request.method == "PATCH" else OrderSerializer

    def retrieve(self, request, *args, **kwargs):
        return success(OrderSerializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        was_paid = order.payment_status == Order.PaymentStatus.PAID

        serializer = self.get_serializer(order, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            serializer.save()
            # Este endpoint es para correcciones manuales (p. ej. conciliar
            # una transferencia que el webhook de PayU nunca vio). Sin este
            # efecto, marcar `payment_status=paid` a mano dejaba una orden
            # "pagada" sin inscripción, sin notificación y sin certificado
            # posible — exactamente lo que sí hace el webhook automático.
            # `enroll_from_order` es idempotente (`get_or_create`), así que
            # repetir el PATCH con el mismo valor no duplica nada.
            if not was_paid and order.payment_status == Order.PaymentStatus.PAID:
                learning_services.enroll_from_order(order)
                dispatch("payment.approved", order=order)

        return success(OrderSerializer(order).data)
