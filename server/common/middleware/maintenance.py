"""Modo mantenimiento (sección 26).

`PlatformSettings.maintenance_mode` existía como campo editable desde
`/admin/settings` pero ningún componente lo leía: activarlo no tenía ningún
efecto observable. Este middleware es lo que le da significado real —
bloquea el tráfico de la API pública mientras está activo.

Quedan exentos:

- `/api/v1/health`               — lo consulta el balanceador/orquestador.
- `/api/v1/settings`             — para que el frontend pueda mostrar el
  aviso de mantenimiento (y el branding) en vez de una pantalla en blanco.
- `/api/v1/auth/*`                — un admin debe poder seguir iniciando
  sesión para desactivar el mantenimiento.
- `/api/v1/admin/*`              — las vistas admin ya exigen `IsAdminRole`
  o `IsSuperAdmin`: dejarlas pasar no expone nada, solo permite operar
  durante el mantenimiento en vez de sumar una pared adicional.
- Todo lo que no cuelgue de `/api/v1/` (Django Admin, `/api/docs`, etc.).

El estado se cachea unos segundos (Redis, sección 48: "cache" es justo una de
las tres responsabilidades que le da la arquitectura). Sin esto, CADA request
no exento pagaría una consulta a Postgres solo para leer un booleano que casi
nunca cambia — el propio `PlatformSettings.objects.load()` además crea la fila
singleton si no existe, así que la primera petición de la vida del proceso
paga adicionalmente un INSERT. Una demora de hasta `_CACHE_TTL_SECONDS` entre
activar el mantenimiento y que efectivamente empiece a bloquear es un
compromiso razonable frente a una consulta por request.
"""

from django.core.cache import cache
from django.db.utils import DatabaseError
from django.http import JsonResponse

from apps.settings.models import PlatformSettings

_EXEMPT_PREFIXES = ("/api/v1/health", "/api/v1/settings", "/api/v1/auth/", "/api/v1/admin/")
_CACHE_KEY = "platform_settings:maintenance_mode"
_CACHE_TTL_SECONDS = 5


class MaintenanceModeMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if self._is_exempt(request.path) or not self._maintenance_active():
            return self.get_response(request)

        # `common.responses.envelope.error()` no sirve aquí: devuelve un
        # `rest_framework.response.Response`, que depende del ciclo de vida
        # de una vista DRF (`finalize_response` le asigna el renderer) para
        # poder renderizarse. Sin pasar por una vista, Django intenta
        # renderizarlo tal cual y revienta con un `AssertionError`.
        return JsonResponse(
            {
                "error": {
                    "code": "MAINTENANCE",
                    "message": "La plataforma está temporalmente en mantenimiento. Vuelve a intentarlo en unos minutos.",
                    "details": {},
                }
            },
            status=503,
        )

    @staticmethod
    def _is_exempt(path: str) -> bool:
        if not path.startswith("/api/v1/"):
            return True
        return path.startswith(_EXEMPT_PREFIXES)

    @staticmethod
    def _maintenance_active() -> bool:
        cached = cache.get(_CACHE_KEY)
        if cached is not None:
            return cached

        try:
            active = PlatformSettings.objects.load().maintenance_mode
        # `DatabaseError` cubre tanto la tabla ausente (`ProgrammingError`,
        # despliegue nuevo con migraciones pendientes) como una conexión caída
        # (`OperationalError`); no se ensancha a `Exception` para no esconder
        # también un bug de programación real en `.load()`.
        except DatabaseError:
            # Se asume que no hay mantenimiento activo antes que exista
            # siquiera la fila que lo declararía. No se cachea este
            # resultado: en cuanto la tabla exista, la siguiente petición
            # debe volver a intentar leerla de verdad.
            return False

        cache.set(_CACHE_KEY, active, _CACHE_TTL_SECONDS)
        return active


def invalidate_cache():
    """Se llama desde `AdminSettingsView.patch` tras guardar.

    Sin esto, activar el mantenimiento seguiría tardando hasta
    `_CACHE_TTL_SECONDS` en surtir efecto — tolerable, pero no hay razón para
    no invalidar de inmediato cuando se sabe exactamente qué cambió.
    """
    cache.delete(_CACHE_KEY)
