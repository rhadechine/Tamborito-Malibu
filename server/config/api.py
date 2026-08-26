"""
Agregador de rutas de la API pública versionada `/api/v1/`.

Sección 34 del documento de arquitectura. Cada dominio agrega sus propias
rutas aquí a medida que se van implementando las fases (Identity, Courses,
Learning, ...). Split 01 — Foundation solo expone el health check.
"""

from django.urls import include, path

from common.health import health_check

urlpatterns = [
    path("health", health_check, name="health-check"),
    path("", include("apps.identity.urls")),
    path("", include("apps.content.urls")),
    path("", include("apps.media.urls")),
    path("", include("apps.courses.urls")),
    path("", include("apps.library.urls")),
    path("", include("apps.museum.urls")),
    path("", include("apps.learning.urls")),
    path("", include("apps.commerce.urls")),
    path("", include("apps.payments.urls")),
    path("", include("apps.donations.urls")),
    path("", include("apps.notifications.urls")),
    path("", include("apps.certificates.urls")),
    path("", include("apps.reports.urls")),
    path("", include("apps.settings.urls")),
]
