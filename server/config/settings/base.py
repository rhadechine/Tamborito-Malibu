"""
Settings base — compartidos por todos los ambientes.

Split 01 — Foundation.
Ver: "Arquitectura Técnica Backend — Tamborito–Malibú", sección 12.
"""

from datetime import timedelta
from pathlib import Path

import environ

# server/config/settings/base.py -> server/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
)

# Lee server/.env si existe (no se versiona; ver .env.example)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="insecure-secret-key-change-me")

DEBUG = env.bool("DJANGO_DEBUG", default=False)

ALLOWED_HOSTS = env.list("DJANGO_ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])

# ---------------------------------------------------------------------------
# Applications
# ---------------------------------------------------------------------------

DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "drf_spectacular",
]

# Los dominios de negocio (apps/*) se van agregando aquí en cada fase.
# Split 02 — Identity.
LOCAL_APPS: list[str] = [
    "apps.identity",
    "apps.content",
    "apps.media",
    "apps.courses",
    "apps.library",
    "apps.museum",
    "apps.learning",
    "apps.commerce",
    "apps.donations",
    "apps.payments",
    "apps.notifications",
    "apps.certificates",
    "apps.reports",
    "apps.settings",
    "apps.audit",
]

AUTH_USER_MODEL = "identity.User"

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# ---------------------------------------------------------------------------
# Middleware
# ---------------------------------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "common.middleware.request_id.RequestIDMiddleware",
    # No depende de sesión/auth (decide por prefijo de ruta): va antes de
    # esas capas para cortar temprano y barato durante un mantenimiento.
    "common.middleware.maintenance.MaintenanceModeMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "common.middleware.logging.RequestLoggingMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# ---------------------------------------------------------------------------
# Base de datos
#
# La conexión apunta a PgBouncer (no directamente a PostgreSQL). Ver sección
# 31.1 del documento de arquitectura: PgBouncer opera en modo
# `transaction pooling`, por lo que CONN_MAX_AGE se mantiene en 0 — Django no
# debe mantener conexiones persistentes propias, PgBouncer ya administra el
# pool de conexiones físicas.
# ---------------------------------------------------------------------------

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DATABASE_NAME", default="tamborito"),
        "USER": env("DATABASE_USER", default="tamborito"),
        "PASSWORD": env("DATABASE_PASSWORD", default="tamborito"),
        "HOST": env("DATABASE_HOST", default="pgbouncer"),
        "PORT": env("DATABASE_PORT", default="6432"),
        "CONN_MAX_AGE": 0,
        "DISABLE_SERVER_SIDE_CURSORS": True,
    }
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ---------------------------------------------------------------------------
# Password validation
# ---------------------------------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# Argon2 como hasher preferente (sección 40 del documento).
PASSWORD_HASHERS = [
    "django.contrib.auth.hashers.Argon2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2PasswordHasher",
    "django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher",
    "django.contrib.auth.hashers.BCryptSHA256PasswordHasher",
]

# ---------------------------------------------------------------------------
# Internacionalización
# ---------------------------------------------------------------------------

LANGUAGE_CODE = "es"
TIME_ZONE = "America/Bogota"
USE_I18N = True
USE_TZ = True

# ---------------------------------------------------------------------------
# Archivos estáticos
# ---------------------------------------------------------------------------

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ---------------------------------------------------------------------------
# Redis / Cache
#
# Sección 48: Redis se usa para cache y rate limiting (Celery se configura
# aparte, ver CELERY_* más abajo). No es fuente principal de verdad.
# ---------------------------------------------------------------------------

REDIS_URL = env("REDIS_URL", default="redis://redis:6379/0")

CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": REDIS_URL,
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
    }
}

# ---------------------------------------------------------------------------
# Celery / RabbitMQ
#
# Sección 29: RabbitMQ como broker, Celery como ejecutor de tareas
# asíncronas. Redis se usa como backend de resultados.
# ---------------------------------------------------------------------------

CELERY_BROKER_URL = env("CELERY_BROKER_URL", default="amqp://guest:guest@rabbitmq:5672//")
CELERY_RESULT_BACKEND = env("CELERY_RESULT_BACKEND", default=REDIS_URL)
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_TIMEZONE = TIME_ZONE
CELERY_TASK_TRACK_STARTED = True

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "common.pagination.default.DefaultPageNumberPagination",
    "PAGE_SIZE": 20,
    "DEFAULT_SCHEMA_CLASS": "common.schema.EnvelopeAutoSchema",
    "EXCEPTION_HANDLER": "common.exceptions.handler.custom_exception_handler",
    "DEFAULT_VERSIONING_CLASS": "rest_framework.versioning.URLPathVersioning",
    "DEFAULT_VERSION": "v1",
    "ALLOWED_VERSIONS": ["v1"],
    # Rate limiting (sección 48: es una de las tres responsabilidades de Redis).
    # El contador vive en CACHES["default"], que ya apunta a Redis.
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {
        # Límites generales, por IP y por usuario autenticado.
        "anon": env("THROTTLE_ANON", default="60/min"),
        "user": env("THROTTLE_USER", default="300/min"),
        # Scopes específicos (ScopedRateThrottle) para los endpoints que son
        # blanco natural de fuerza bruta o abuso.
        "auth": env("THROTTLE_AUTH", default="10/min"),
        "register": env("THROTTLE_REGISTER", default="5/hour"),
        "donation": env("THROTTLE_DONATION", default="10/hour"),
        "upload": env("THROTTLE_UPLOAD", default="30/hour"),
        "webhook": env("THROTTLE_WEBHOOK", default="240/min"),
        "verify": env("THROTTLE_VERIFY", default="20/min"),
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Tamborito–Malibú API",
    "DESCRIPTION": (
        "API de la plataforma Fundación Tamborito + Museo Arqueológico Malibú."
    ),
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "SCHEMA_PATH_PREFIX": r"/api/v[0-9]+",
    "POSTPROCESSING_HOOKS": [
        "drf_spectacular.hooks.postprocess_schema_enums",
        "common.schema.add_error_envelope",
    ],
}

# ---------------------------------------------------------------------------
# CORS
#
# Sección 41: nunca CORS_ALLOW_ALL_ORIGINS = True en producción. Cada
# ambiente declara explícitamente sus orígenes permitidos.
# ---------------------------------------------------------------------------

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])

# La autenticación es JWT por header `Authorization` (sección 40), no
# cookies de sesión: el frontend nunca necesita que el navegador envíe ni
# reciba credenciales en una petición cross-origin. Dejar esto en True sin
# usarlo no habilita nada útil y solo amplía la superficie de qué puede
# hacer un origen ya permitido (p. ej. si `DEFAULT_AUTHENTICATION_CLASSES`
# ganara `SessionAuthentication` más adelante, esto empezaría a importar de
# verdad — hasta entonces, False es lo que corresponde a lo que existe hoy).
CORS_ALLOW_CREDENTIALS = False

# ---------------------------------------------------------------------------
# File storage (S3 / MinIO) — Split 04, se activa a partir de la Fase
# correspondiente a Media. Se deja declarado desde Foundation para que las
# variables de entorno ya existan.
# ---------------------------------------------------------------------------

AWS_ACCESS_KEY_ID = env("AWS_ACCESS_KEY_ID", default="")
AWS_SECRET_ACCESS_KEY = env("AWS_SECRET_ACCESS_KEY", default="")
AWS_STORAGE_BUCKET_NAME = env("AWS_STORAGE_BUCKET_NAME", default="tamborito")
AWS_S3_ENDPOINT_URL = env("AWS_S3_ENDPOINT_URL", default="http://minio:9000")
AWS_S3_REGION_NAME = env("AWS_S3_REGION_NAME", default="us-east-1")
AWS_S3_FILE_OVERWRITE = False
AWS_DEFAULT_ACL = None

MEDIA_URL = "media/"
MEDIA_ROOT = BASE_DIR / "media"

# ---------------------------------------------------------------------------
# Límites de subida (sección 15)
#
# `MEDIA_ALLOWED_UPLOAD_TYPES` mapea extensión -> MIME canónico. La extensión
# es lo que determina cómo sirve el archivo un webserver/CDN, así que es lo
# que se valida; el `Content-Type` que declara el cliente NUNCA se guarda tal
# cual (se reemplaza por el MIME canónico de esta tabla). Deliberadamente
# fuera de la lista: .svg y .html, que se ejecutan como markup en el navegador
# y convertirían la subida en un XSS almacenado.
# ---------------------------------------------------------------------------

MEDIA_MAX_UPLOAD_SIZE = env.int("MEDIA_MAX_UPLOAD_SIZE", default=25 * 1024 * 1024)  # 25 MB

MEDIA_ALLOWED_UPLOAD_TYPES = {
    # Imágenes
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "webp": "image/webp",
    # Documentos
    "pdf": "application/pdf",
    "txt": "text/plain",
    "csv": "text/csv",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    # Audio / video
    "mp3": "audio/mpeg",
    "wav": "audio/wav",
    "mp4": "video/mp4",
    "webm": "video/webm",
    # Comprimidos (evidencias con varios archivos)
    "zip": "application/zip",
}

# Cortan el request antes de que llegue a la vista.
DATA_UPLOAD_MAX_MEMORY_SIZE = MEDIA_MAX_UPLOAD_SIZE + (1024 * 1024)
FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024  # a partir de aquí, a disco temporal
DATA_UPLOAD_MAX_NUMBER_FIELDS = 500

# ponytail: credenciales S3 aún no disponibles (Split 04). Mientras
# AWS_ACCESS_KEY_ID esté vacío se usa almacenamiento local en disco; en cuanto
# se configuren las credenciales en .env, el backend cambia solo a S3 sin
# tocar código.
STORAGES = {
    "default": {
        "BACKEND": (
            "storages.backends.s3boto3.S3Boto3Storage"
            if AWS_ACCESS_KEY_ID
            else "django.core.files.storage.FileSystemStorage"
        ),
    },
    "staticfiles": {
        "BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage",
    },
}

# ---------------------------------------------------------------------------
# Pasarela de pago — PayU (sección 19: el proveedor concreto quedaba
# pendiente en el documento fuente; se selecciona PayU Latam / PSE).
# ---------------------------------------------------------------------------

PAYU_API_KEY = env("PAYU_API_KEY", default="")
PAYU_MERCHANT_ID = env("PAYU_MERCHANT_ID", default="")
PAYU_ACCOUNT_ID = env("PAYU_ACCOUNT_ID", default="")
PAYU_TEST_MODE = env.bool("PAYU_TEST_MODE", default=True)
PAYU_CHECKOUT_URL = env(
    "PAYU_CHECKOUT_URL", default="https://sandbox.checkout.payulatam.com/ppp-web-gateway-payu/"
)
PAYU_RESPONSE_URL = env("PAYU_RESPONSE_URL", default="")
PAYU_CONFIRMATION_URL = env("PAYU_CONFIRMATION_URL", default="")

# Transaction API (reembolsos) — distinta de la URL de WebCheckout de arriba.
PAYU_API_LOGIN = env("PAYU_API_LOGIN", default="")
PAYU_TRANSACTION_API_URL = env(
    "PAYU_TRANSACTION_API_URL", default="https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi"
)

# ---------------------------------------------------------------------------
# Logging estructurado
#
# Sección 47: formato estructurado con request_id, user_id, service, event.
# ---------------------------------------------------------------------------

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "structured": {
            "()": "common.utils.logging_formatter.StructuredFormatter",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "structured",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": env("DJANGO_LOG_LEVEL", default="INFO"),
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": env("DJANGO_LOG_LEVEL", default="INFO"),
            "propagate": False,
        },
    },
}
