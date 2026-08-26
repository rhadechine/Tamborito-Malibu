"""Validaciones de configuración extraídas de `config/settings/production.py`.

Viven aparte para poder testearlas como funciones puras, sin tener que
recargar módulos de settings de Django dentro de la suite (`production.py`
ejecuta su cuerpo una sola vez, al importarse; simular "qué pasaría con otro
valor de env" ahí dentro exigiría manipular el proceso de import).
"""

from django.core.exceptions import ImproperlyConfigured

INSECURE_SECRET_KEY_DEFAULT = "insecure-secret-key-change-me"


def require_real_secret_key(secret_key: str) -> None:
    """`base.py` cae a `INSECURE_SECRET_KEY_DEFAULT` si falta la variable de
    entorno, a propósito: así el proyecto arranca sin fricción en un
    `git clone` nuevo. En producción ese default es exactamente lo contrario
    de lo que se quiere — preferible que el proceso ni siquiera levante.
    """
    if secret_key == INSECURE_SECRET_KEY_DEFAULT:
        raise ImproperlyConfigured(
            "DJANGO_SECRET_KEY no está configurada (o usa el valor de ejemplo). "
            "Es obligatoria en producción."
        )


INSECURE_BROKER_CREDENTIALS = "guest:guest"


def require_real_broker_credentials(broker_url: str) -> None:
    """`base.py` cae a `amqp://guest:guest@rabbitmq:5672//` si falta la
    variable (sección 29) — cómodo para `docker compose up` en un laptop,
    pero `guest`/`guest` es la credencial más adivinada que existe para
    RabbitMQ. En producción se exige una URL con credenciales propias.
    """
    if INSECURE_BROKER_CREDENTIALS in broker_url:
        raise ImproperlyConfigured(
            "CELERY_BROKER_URL sigue usando las credenciales de ejemplo (guest:guest). "
            "Configura un usuario y contraseña propios de RabbitMQ para producción."
        )
