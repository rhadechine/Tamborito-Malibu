"""Paginación por defecto, alineada al contrato de la sección 63."""

from rest_framework.pagination import (
    PageNumberPagination,  # pyright: ignore[reportMissingImports]
)
from rest_framework.response import Response


class DefaultPageNumberPagination(PageNumberPagination):
    page_size_query_param = "page_size"
    max_page_size = 100

    def get_paginated_response_schema(self, schema):
        """Forma real de la respuesta paginada, para el OpenAPI.

        Sin esto drf-spectacular documenta el formato por defecto de DRF
        (`count`/`next`/`previous`/`results`), que esta API no usa.
        """
        return {
            "type": "object",
            "properties": {
                "data": schema,
                "meta": {
                    "type": "object",
                    "properties": {
                        "count": {"type": "integer", "example": 123},
                        "page": {"type": "integer", "example": 1},
                        "page_size": {"type": "integer", "example": 20},
                    },
                    "required": ["count", "page", "page_size"],
                },
            },
            "required": ["data", "meta"],
        }

    def get_paginated_response(self, data):
        return Response(
            {
                "data": data,
                "meta": {
                    "count": self.page.paginator.count,
                    "page": self.page.number,
                    "page_size": self.get_page_size(self.request),
                },
            }
        )
