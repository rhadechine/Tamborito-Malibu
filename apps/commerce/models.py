"""Split 07 — Commerce (sección 18).

Regla crítica: el precio se congela en cascada
Course.price -> CartItem.price_snapshot -> OrderItem.price_snapshot.
"""

import uuid

from django.conf import settings
from django.db import models

from apps.courses.models import Course


class CartManager(models.Manager):
    def active_for(self, user):
        cart, _ = self.get_or_create(user=user, status=Cart.Status.ACTIVE)
        return cart


class Cart(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        CHECKED_OUT = "checked_out", "Checked out"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="carts")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = CartManager()

    class Meta:
        constraints = [
            # Sin este índice único parcial, `CartManager.active_for` (usa
            # `get_or_create`) tiene una carrera real: dos requests
            # concurrentes del mismo usuario (dos pestañas, un doble clic)
            # pueden pasar ambas el `get()` en el mismo instante y crear dos
            # carritos "active". A partir de ahí, cualquier siguiente
            # `get_or_create` para ese usuario revienta con
            # `MultipleObjectsReturned` — un 500 permanente hasta corregir la
            # fila a mano. Con el constraint, Django detecta el
            # `IntegrityError` de la segunda inserción y reintenta el `get()`
            # automáticamente (comportamiento estándar de `get_or_create`).
            models.UniqueConstraint(
                fields=["user"],
                condition=models.Q(status="active"),
                name="one_active_cart_per_user",
            )
        ]

    def __str__(self):
        return f"cart#{self.id}({self.user_id})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name="items")
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["cart", "course"]


def _generate_order_number():
    return uuid.uuid4().hex[:12].upper()


class Order(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        FAILED = "failed", "Failed"
        REFUNDED = "refunded", "Refunded"

    class OrderStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    order_number = models.CharField(max_length=20, unique=True, default=_generate_order_number)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="orders")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default="COP")
    payment_status = models.CharField(max_length=16, choices=PaymentStatus.choices, default=PaymentStatus.PENDING)
    order_status = models.CharField(max_length=16, choices=OrderStatus.choices, default=OrderStatus.PENDING)
    payment_method = models.CharField(max_length=50, blank=True)
    transaction_reference = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.order_number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, blank=True)
    title_snapshot = models.CharField(max_length=200)
    price_snapshot = models.DecimalField(max_digits=10, decimal_places=2)
