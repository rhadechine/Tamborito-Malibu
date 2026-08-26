"""Split 13 — Certificates (sección 24)."""

import uuid

from django.conf import settings
from django.db import models

from apps.media.models import MediaAsset


def _generate_code():
    return f"CERT-{uuid.uuid4().hex[:10].upper()}"


class Certificate(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="certificates")
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="certificates")
    code = models.CharField(max_length=20, unique=True, default=_generate_code)
    issued_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    pdf_media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ["user", "course"]
        ordering = ["-issued_at"]

    def __str__(self):
        return self.code
