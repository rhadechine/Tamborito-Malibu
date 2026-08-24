"""Bloque bajo de la revisión de seguridad: #29, #30, #33, #34.

`common/` no está en `testpaths` (pytest.ini solo escanea `tests` y `apps`),
así que estos tests viven aquí en vez de junto al código que prueban.
"""

import json
import logging

import pytest
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.test import RequestFactory

from common.middleware.request_id import REQUEST_ID_HEADER, RequestIDMiddleware
from common.settings_guards import require_real_broker_credentials
from common.utils.logging_formatter import StructuredFormatter

# ---------------------------------------------------------------------------
# #29: el request id entrante se valida antes de reflejarlo y de usarlo en
# cada línea de log — un valor fuera de forma se descarta y se genera uno
# propio, en vez de confiar ciegamente en lo que mande el cliente.
# ---------------------------------------------------------------------------


def _run_middleware(header_value=None):
    def get_response(request):
        from django.http import HttpResponse

        return HttpResponse()

    middleware = RequestIDMiddleware(get_response)
    # `request.headers` es una `cached_property` construida a partir de
    # META en el primer acceso: hay que poner el header ahí ANTES de que el
    # middleware lea `.headers` por primera vez.
    extra_headers = {"HTTP_X_REQUEST_ID": header_value} if header_value is not None else {}
    request = RequestFactory().get("/", **extra_headers)
    return middleware(request), request


def test_a_well_formed_incoming_request_id_is_respected():
    response, request = _run_middleware("abc-123.def_456")

    assert request.request_id == "abc-123.def_456"
    assert response[REQUEST_ID_HEADER] == "abc-123.def_456"


def test_an_oversized_incoming_request_id_is_replaced():
    _, request = _run_middleware("x" * 500)

    assert request.request_id != "x" * 500
    assert len(request.request_id) < 100


def test_a_request_id_with_control_characters_is_replaced():
    _, request = _run_middleware("abc\r\nSet-Cookie: evil=1")

    assert "\r" not in request.request_id
    assert "\n" not in request.request_id
    assert request.request_id != "abc\r\nSet-Cookie: evil=1"


def test_a_missing_request_id_still_generates_one():
    response, request = _run_middleware(None)

    assert request.request_id
    assert response[REQUEST_ID_HEADER] == request.request_id


# ---------------------------------------------------------------------------
# #30: el formatter estructurado redacta valores de claves con pinta de
# secreto en cualquier nivel de anidamiento de `extra`.
# ---------------------------------------------------------------------------


def _format(**extra):
    record = logging.LogRecord(
        name="tamborito.test", level=logging.INFO, pathname=__file__, lineno=1,
        msg="algo pasó", args=(), exc_info=None,
    )
    for key, value in extra.items():
        setattr(record, key, value)
    return json.loads(StructuredFormatter().format(record))


def test_a_top_level_sensitive_key_is_redacted():
    payload = _format(password="hunter2", user_id=7)

    assert payload["password"] == "[REDACTED]"
    assert payload["user_id"] == 7


def test_a_nested_sensitive_key_is_redacted():
    payload = _format(details={"refresh_token": "abc.def.ghi", "order_id": 42})

    assert payload["details"]["refresh_token"] == "[REDACTED]"
    assert payload["details"]["order_id"] == 42


def test_sensitive_keys_inside_a_list_are_redacted():
    payload = _format(events=[{"api_key": "sk_live_123"}, {"amount": "100.00"}])

    assert payload["events"][0]["api_key"] == "[REDACTED]"
    assert payload["events"][1]["amount"] == "100.00"


def test_non_sensitive_data_passes_through_untouched():
    payload = _format(request_id="abc-123", method="GET", status_code=200)

    assert payload["request_id"] == "abc-123"
    assert payload["method"] == "GET"
    assert payload["status_code"] == 200


# ---------------------------------------------------------------------------
# #33: producción no puede arrancar con las credenciales de ejemplo de
# RabbitMQ.
# ---------------------------------------------------------------------------


def test_require_real_broker_credentials_rejects_the_example_default():
    with pytest.raises(ImproperlyConfigured):
        require_real_broker_credentials("amqp://guest:guest@rabbitmq:5672//")


def test_require_real_broker_credentials_accepts_real_credentials():
    require_real_broker_credentials("amqp://tamborito:una-clave-real@rabbitmq:5672//")


# ---------------------------------------------------------------------------
# #34: sin cookies de sesión cross-origin — la API es JWT por header.
# ---------------------------------------------------------------------------


def test_cors_does_not_allow_credentials():
    assert settings.CORS_ALLOW_CREDENTIALS is False
