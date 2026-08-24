"""Split 15 — Settings (sección 26).

Configuración operativa editable desde el panel admin: branding, contacto,
feature flags. Deliberadamente NO incluye nada de infraestructura sensible
(credenciales, hosts de base de datos, claves de API) — eso vive únicamente
en variables de entorno (`config/settings/*.py`), nunca en una tabla editable
desde el frontend, tal como exige la sección 26.

Singleton: una sola fila. `PlatformSettings.objects.load()` la trae (o la
crea con valores por defecto la primera vez).
"""

from django.db import models

from apps.media.models import MediaAsset


class PlatformSettingsManager(models.Manager):
    def load(self):
        settings_row, _created = self.get_or_create(pk=1)
        return settings_row


class PlatformSettings(models.Model):
    platform_name = models.CharField(max_length=150, default="Tamborito–Malibú")
    logo_media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    primary_color = models.CharField(max_length=20, blank=True)
    secondary_color = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=32, blank=True)
    contact_address = models.CharField(max_length=255, blank=True)
    feature_flags = models.JSONField(default=dict, blank=True)
    maintenance_mode = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    objects = PlatformSettingsManager()

    def save(self, *args, **kwargs):
        self.pk = 1  # fuerza el singleton independientemente de cómo se instancie
        super().save(*args, **kwargs)

    def __str__(self):
        return self.platform_name
