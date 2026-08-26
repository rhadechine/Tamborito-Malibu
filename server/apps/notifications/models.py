"""Split 12 — Notifications (sección 23)."""

from django.conf import settings
from django.db import models


class Notification(models.Model):
    class Type(models.TextChoices):
        ENROLLMENT = "enrollment", "Enrollment"
        PAYMENT = "payment", "Payment"
        EVIDENCE = "evidence", "Evidence"
        DONATION = "donation", "Donation"
        CERTIFICATE = "certificate", "Certificate"
        ACCOUNT = "account", "Account"
        GENERAL = "general", "General"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=200)
    message = models.TextField(blank=True)
    type = models.CharField(max_length=16, choices=Type.choices, default=Type.GENERAL)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"notification#{self.id}({self.user_id}, {self.type})"
