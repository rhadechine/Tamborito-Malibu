"""Generación de OpenAPI fiel al contrato de la sección 63.

Toda respuesta de éxito de esta API va envuelta:

    detalle  {"data": {...}, "meta": {}}
    lista    {"data": [...], "meta": {"count", "page", "page_size"}}
    error    {"error": {"code", "message", "details"}}

`drf_spectacular.openapi.AutoSchema` no lo sabe: infiere la respuesta del
serializer y documentaba `Course` donde la API devuelve
`{"data": Course, "meta": {}}`. Es decir, el schema —y por lo tanto
`/api/docs`— describía mal prácticamente todos los endpoints, que es peor que
no describirlos: quien construya el panel de administración codificaría
contra una forma que no existe.

`EnvelopeAutoSchema` envuelve cada respuesta 2xx. Los listados paginados los
envuelve ya `DefaultPageNumberPagination.get_paginated_response_schema()`, así
que ahí no se vuelve a envolver.
"""

from drf_spectacular.openapi import AutoSchema
from drf_spectacular.plumbing import force_instance, get_override
from rest_framework import serializers

ERROR_COMPONENT_NAME = "ErrorEnvelope"

ERROR_ENVELOPE_SCHEMA = {
    "type": "object",
    "properties": {
        "error": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "enum": [
                        "BAD_REQUEST",
                        "UNAUTHENTICATED",
                        "FORBIDDEN",
                        "NOT_FOUND",
                        "METHOD_NOT_ALLOWED",
                        "CONFLICT",
                        "RATE_LIMITED",
                        "INTERNAL_ERROR",
                    ],
                },
                "message": {"type": "string"},
                "details": {"type": "object", "additionalProperties": True},
            },
            "required": ["code", "message"],
        }
    },
    "required": ["error"],
}


def envelope(data_schema: dict) -> dict:
    return {
        "type": "object",
        "properties": {"data": data_schema, "meta": {"type": "object"}},
        "required": ["data", "meta"],
    }


class EnvelopeAutoSchema(AutoSchema):
    def _get_response_for_code(self, serializer, status_code, media_types=None, direction="response"):
        response = super()._get_response_for_code(serializer, status_code, media_types, direction)

        if direction != "response" or "content" not in response:
            return response
        if not ("200" <= str(status_code) < "300"):
            return response
        if self._already_enveloped_by_paginator(serializer, status_code):
            return response

        for media_type, media in response["content"].items():
            # Una descarga binaria (FileResponse) no va envuelta.
            if media_type == "application/json" and "schema" in media:
                media["schema"] = envelope(media["schema"])
        return response

    def _already_enveloped_by_paginator(self, serializer, status_code) -> bool:
        """Réplica de la condición con la que AutoSchema aplica el paginador."""
        instance = force_instance(serializer)
        if not instance:
            return False
        return bool(
            self._is_list_view(instance)
            and get_override(instance, "many") is not False
            and self._get_paginator()
        )


def add_error_envelope(result, generator, request, public):
    """Postprocessing hook: documenta el contrato de error en cada operación.

    El panel necesita saber que un fallo siempre llega como
    `{"error": {"code", ...}}` para poder reaccionar al `code` en vez de
    parsear mensajes.
    """
    components = result.setdefault("components", {}).setdefault("schemas", {})
    components[ERROR_COMPONENT_NAME] = ERROR_ENVELOPE_SCHEMA

    reference = {"$ref": f"#/components/schemas/{ERROR_COMPONENT_NAME}"}

    for path_item in result.get("paths", {}).values():
        for operation in path_item.values():
            if not isinstance(operation, dict) or "responses" not in operation:
                continue
            operation["responses"].setdefault(
                "4XX",
                {
                    "description": "Error de cliente (contrato de la sección 63).",
                    "content": {"application/json": {"schema": reference}},
                },
            )
    return result


# --- Serializers de documentación -----------------------------------------
#
# Existen para que el OpenAPI describa las respuestas pequeñas que hoy se
# construyen como diccionarios sueltos en la vista.


class UrlResponseSerializer(serializers.Serializer):
    url = serializers.URLField()


class PaymentStatusResponseSerializer(serializers.Serializer):
    status = serializers.CharField()


class CourseStatusResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.CharField()
