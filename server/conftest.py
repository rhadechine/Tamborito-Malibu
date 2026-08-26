"""Configuración global de pytest.

Aísla la suite de la infraestructura externa (Redis) y del rate limiting.
El throttling se desactiva por defecto porque su contador es por IP y vive en
el cache del proceso: dejarlo activo hace que un test empiece a fallar según
cuántos tests anteriores hayan pegado al mismo endpoint.

`SimpleRateThrottle.THROTTLE_RATES` se lee **una sola vez al importar DRF**
(es un atributo de clase), así que no basta con reescribir
`settings.REST_FRAMEWORK`: hay que parchear la clase.
"""

import pytest
from django.core.cache import cache
from rest_framework.throttling import SimpleRateThrottle


@pytest.fixture(autouse=True)
def _isolated_cache_and_no_throttling(settings, monkeypatch):
    settings.CACHES = {
        "default": {
            "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
            "LOCATION": "tamborito-tests",
        }
    }
    cache.clear()

    disabled = {scope: None for scope in settings.REST_FRAMEWORK["DEFAULT_THROTTLE_RATES"]}
    monkeypatch.setattr(SimpleRateThrottle, "THROTTLE_RATES", disabled)


@pytest.fixture
def enable_throttling(monkeypatch):
    """Reactiva scopes concretos: `enable_throttling({"auth": "3/min"})`."""

    def _enable(rates):
        monkeypatch.setattr(
            SimpleRateThrottle, "THROTTLE_RATES", {**SimpleRateThrottle.THROTTLE_RATES, **rates}
        )
        cache.clear()

    return _enable
