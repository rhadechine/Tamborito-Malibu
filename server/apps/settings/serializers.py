from rest_framework import serializers

from .models import PlatformSettings


class PlatformSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformSettings
        fields = [
            "platform_name", "logo_media", "primary_color", "secondary_color",
            "contact_email", "contact_phone", "contact_address",
            "feature_flags", "maintenance_mode", "updated_at",
        ]
        read_only_fields = ["updated_at"]


class PublicPlatformSettingsSerializer(serializers.ModelSerializer):
    """Subconjunto seguro para `GET /settings` (sin autenticación).

    Deliberadamente fuera: `feature_flags` (puede describir capacidades
    internas todavía no anunciadas) y `contact_address` (más sensible que un
    correo/teléfono de contacto genérico, y no es algo que hoy consuma el
    frontend). `maintenance_mode` sí se expone: es precisamente lo que le
    permite al frontend mostrar un aviso en vez de una pantalla en blanco
    cuando `MaintenanceModeMiddleware` está bloqueando todo lo demás.
    """

    class Meta:
        model = PlatformSettings
        fields = [
            "platform_name", "logo_media", "primary_color", "secondary_color",
            "contact_email", "contact_phone", "maintenance_mode",
        ]
        read_only_fields = fields
