"""
Contrato de respuesta API — sección 63 del documento de arquitectura.

Success:  {"data": ..., "meta": {...}}
List:     {"data": [...], "meta": {"count", "page", "page_size"}}
Error:    {"error": {"code", "message", "details"}}
"""

from rest_framework.response import Response


def success(data, meta: dict | None = None, status: int = 200) -> Response:
    return Response({"data": data, "meta": meta or {}}, status=status)


def error(code: str, message: str, details: dict | None = None, status: int = 400) -> Response:
    return Response(
        {"error": {"code": code, "message": message, "details": details or {}}},
        status=status,
    )
