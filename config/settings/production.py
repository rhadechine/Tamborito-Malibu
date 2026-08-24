"""Settings de producción."""

from common.settings_guards import (
    require_real_broker_credentials,
    require_real_secret_key,
)

from .base import *
from .base import (
    env,
)

DEBUG = False

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS")

require_real_secret_key(SECRET_KEY)
require_real_broker_credentials(CELERY_BROKER_URL)

# Seguridad HTTP (sección 12, "Seguridad HTTP" en Split 01 — Foundation).
#
# La arquitectura (sección 49) pone Nginx delante de Django/Gunicorn. Nginx
# termina TLS y reenvía por HTTP en la red interna; sin decirle a Django que
# confíe en `X-Forwarded-Proto`, `request.is_secure()` siempre da False detrás
# del proxy y SECURE_SSL_REDIRECT entra en un bucle infinito de redirecciones
# (cada redirect "a https" vuelve a llegar como HTTP interno). El nombre de
# cabecera debe coincidir exactamente con el que fija el Nginx real.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 60 * 60 * 24 * 30
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True
X_FRAME_OPTIONS = "DENY"

# En producción los orígenes CORS deben declararse explícitamente vía env,
# nunca CORS_ALLOW_ALL_ORIGINS = True (sección 41).
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")

# ---------------------------------------------------------------------------
# Documentación OpenAPI (sección 43)
#
# drf-spectacular sirve /api/schema, /api/docs y /api/redoc con
# SERVE_PERMISSIONS = AllowAny por defecto: la superficie completa de la API
# —incluida la existencia de cada endpoint admin— queda enumerable sin
# autenticación. En desarrollo eso es justamente lo útil (el frontend la
# consulta sin loguearse); en producción se exige sesión de staff.
# ---------------------------------------------------------------------------

SPECTACULAR_SETTINGS = {
    **SPECTACULAR_SETTINGS,
    "SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"],
    "SERVE_AUTHENTICATION": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
}
