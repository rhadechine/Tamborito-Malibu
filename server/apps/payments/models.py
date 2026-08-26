"""Split 08 — Payments (sección 19).

Proveedor: PayU Latam (PSE incluido). Un PaymentIntent paga exactamente un
Order (Commerce) o una Donation (Donations) — nunca ambos.
"""

import uuid
from decimal import Decimal

from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models


def _generate_reference_code():
    return uuid.uuid4().hex[:16].upper()


class PaymentIntent(models.Model):
    class Provider(models.TextChoices):
        PAYU = "payu", "PayU"

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        PENDING_REVIEW = "pending_review", "Pending review"
        EXPIRED = "expired", "Expired"
        REFUNDED = "refunded", "Refunded"

    order = models.ForeignKey(
        "commerce.Order", on_delete=models.CASCADE, null=True, blank=True, related_name="payment_intents"
    )
    donation = models.ForeignKey(
        "donations.Donation", on_delete=models.CASCADE, null=True, blank=True, related_name="payment_intents"
    )
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    provider = models.CharField(max_length=16, choices=Provider.choices, default=Provider.PAYU)
    method = models.CharField(max_length=50, blank=True)
    amount = models.DecimalField(
        max_digits=10, decimal_places=2, validators=[MinValueValidator(Decimal("0.01"))]
    )
    currency = models.CharField(max_length=3, default="COP")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    reference_code = models.CharField(max_length=32, unique=True, default=_generate_reference_code)
    provider_reference = models.CharField(max_length=100, blank=True)
    redirect_url = models.URLField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(order__isnull=False, donation__isnull=True)
                    | models.Q(order__isnull=True, donation__isnull=False)
                ),
                name="payment_intent_targets_order_xor_donation",
            )
        ]

    def __str__(self):
        return f"intent#{self.reference_code}({self.status})"


class PaymentEvent(models.Model):
    payment_intent = models.ForeignKey(PaymentIntent, on_delete=models.CASCADE, related_name="events")
    provider_event_id = models.CharField(max_length=100)
    event_type = models.CharField(max_length=32)
    payload_json = models.JSONField(default=dict, blank=True)
    received_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Idempotencia (sección 46): un mismo evento del proveedor no se procesa dos veces.
        unique_together = ["payment_intent", "provider_event_id"]
