"""
Request logging middleware — Split 01 (Foundation).

Registra cada request/response con el formato estructurado descrito en la
sección 47 del documento de arquitectura (request_id, user_id, método, path,
status, duración).
"""

import logging
import time

logger = logging.getLogger("tamborito.request")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started_at = time.monotonic()
        response = self.get_response(request)
        duration_ms = round((time.monotonic() - started_at) * 1000, 2)

        user = getattr(request, "user", None)
        user_id = getattr(user, "id", None) if user and user.is_authenticated else None

        logger.info(
            "request.completed",
            extra={
                "request_id": getattr(request, "request_id", None),
                "user_id": user_id,
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response
