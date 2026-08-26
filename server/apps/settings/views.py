from drf_spectacular.utils import extend_schema
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.events import dispatch
from common.middleware.maintenance import (
    invalidate_cache as invalidate_maintenance_cache,
)
from common.permissions import IsSuperAdmin
from common.responses.envelope import success

from .models import PlatformSettings
from .serializers import PlatformSettingsSerializer, PublicPlatformSettingsSerializer


@extend_schema(request=PlatformSettingsSerializer, responses={200: PlatformSettingsSerializer})
class AdminSettingsView(APIView):
    # Configuracion global del ecosistema (branding, feature flags,
    # maintenance_mode): no es acotable por organizacion, la administra el
    # super_admin igual que la vista financiera.
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        return success(PlatformSettingsSerializer(PlatformSettings.objects.load()).data)

    def patch(self, request):
        instance = PlatformSettings.objects.load()
        serializer = PlatformSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        invalidate_maintenance_cache()
        dispatch("settings.updated", settings_row=instance, actor_user=request.user)
        return success(serializer.data)


@extend_schema(responses={200: PublicPlatformSettingsSerializer})
class PublicSettingsView(APIView):
    """GET /settings — branding y contacto, sin sesión.

    Es lo que consulta cualquier página pública (footer, logo, aviso de
    mantenimiento) y lo que un admin de organización necesita para pintar su
    propio panel: `/admin/settings` quedó reservado al super_admin (sección
    39), pero leer la marca de la plataforma no es una operación
    administrativa.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        return success(PublicPlatformSettingsSerializer(PlatformSettings.objects.load()).data)
