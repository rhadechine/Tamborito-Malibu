"""
Exception handler global de DRF — normaliza todos los errores al contrato
de la sección 63 del documento de arquitectura:

    {"error": {"code": ..., "message": ..., "details": {...}}}
"""

import logging

from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger("tamborito.exceptions")

DEFAULT_ERROR_CODE = "INTERNAL_ERROR"

_STATUS_CODE_TO_ERROR_CODE = {
    400: "BAD_REQUEST",
    401: "UNAUTHENTICATED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    409: "CONFLICT",
    429: "RATE_LIMITED",
}


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)

    if response is None:
        # Excepción no manejada por DRF (bug, error de infraestructura, etc.)
        request = context.get("request")
        logger.exception(
            "unhandled_exception",
            extra={"request_id": getattr(request, "request_id", None)},
        )
        return None

    error_code = _STATUS_CODE_TO_ERROR_CODE.get(response.status_code, DEFAULT_ERROR_CODE)
    details = response.data if isinstance(response.data, (dict, list)) else {"detail": response.data}

    message = (
        details.get("detail")
        if isinstance(details, dict) and "detail" in details
        else "Ocurrió un error procesando la solicitud."
    )

    response.data = {
        "error": {
            "code": error_code,
            "message": str(message),
            "details": details,
        }
    }
    return response
