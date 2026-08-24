"""
App de Celery — sección 29 del documento de arquitectura.

RabbitMQ como broker, Redis como backend de resultados. Las colas por
dominio (notifications, certificates, reports, audit, integrations) se
declaran a medida que cada dominio agrega sus propias tasks.
"""

import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.development")

app = Celery("tamborito")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()
