"""
Health check — Split 01 (Foundation).

GET /api/v1/health

Verifica conectividad real contra las dependencias críticas (PostgreSQL vía
PgBouncer y Redis), no solamente que el proceso Django esté vivo.
"""

from django.db import connections
from django.db.utils import OperationalError
from django_redis import get_redis_connection
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from redis.exceptions import RedisError
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


def _check_database() -> bool:
    try:
        connections["default"].cursor()
        return True
    except OperationalError:
        return False


def _check_redis() -> bool:
    try:
        get_redis_connection("default").ping()
        return True
    # `RedisError` cubre lo que puede fallar en un `.ping()` real (timeout,
    # conexión rechazada, auth). `NotImplementedError` cubre el caso legítimo
    # de que `CACHES["default"]` no sea un backend Redis en absoluto (p. ej.
    # `LocMemCache` en tests, ver conftest.py): `get_redis_connection` la
    # lanza porque ese backend no expone un cliente Redis, no porque Redis
    # esté caído — igualmente se reporta como "no disponible" en el health
    # check. No se ensancha a `Exception` para no esconder también un bug de
    # programación como un `AttributeError`.
    except (RedisError, NotImplementedError):
        return False


@extend_schema(
    responses={200: OpenApiTypes.OBJECT, 503: OpenApiTypes.OBJECT},
    description="Estado del proceso y de sus dependencias críticas (PostgreSQL y Redis).",
)
@api_view(["GET"])
@permission_classes([AllowAny])
@throttle_classes([])  # lo consulta el load balancer, no debe limitarse
def health_check(request):
    checks = {
        "database": _check_database(),
        "redis": _check_redis(),
    }
    healthy = all(checks.values())

    return Response(
        {
            "data": {
                "status": "ok" if healthy else "degraded",
                "checks": checks,
            },
            "meta": {},
        },
        status=200 if healthy else 503,
    )
