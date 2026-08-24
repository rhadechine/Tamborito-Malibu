"""Split 09 — Donations (sección 20).

payment_intent no existe todavía (Payments — Split 08 — no está implementado);
se sigue el mismo patrón que Commerce (sección 18) y se registra el estado del
pago directamente en el modelo mediante `status` + `transaction_reference`.
"""

from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


class Donation(models.Model):
    class Target(models.TextChoices):
        ECOSYSTEM = "ecosystem", "Ecosystem"
        FOUNDATION = "foundation", "Foundation"
        MUSEUM = "museum", "Museum"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    donor_user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="donations"
    )
    donor_name = models.CharField(max_length=150)
    donor_email = models.EmailField()
    organization_target = models.CharField(max_length=16, choices=Target.choices)
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    currency = models.CharField(max_length=3, default="COP")
    message = models.TextField(blank=True)
    transaction_reference = models.CharField(max_length=100, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"donation#{self.id}({self.organization_target}, {self.amount})"

    def save(self, *args, **kwargs):
        if self.status == self.Status.APPROVED and self.confirmed_at is None:
            from django.utils import timezone

            self.confirmed_at = timezone.now()
        super().save(*args, **kwargs)
