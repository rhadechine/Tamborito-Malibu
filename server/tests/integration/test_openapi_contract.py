"""El OpenAPI debe describir la API tal como es (sección 63).

`/api/docs` es lo que lee quien construye el panel de administración. Un
schema equivocado es peor que uno incompleto: hace que se codifique contra
una forma que no existe. Estos tests fijan las tres invariantes del contrato.
"""

import pytest
from drf_spectacular.generators import SchemaGenerator

BINARY_MEDIA = "application/octet-stream"


@pytest.fixture(scope="module")
def schema():
    return SchemaGenerator().get_schema(request=None, public=True)


def _resolve(schema, body):
    """Sigue un $ref hasta el componente al que apunta."""
    ref = body.get("$ref")
    if not ref:
        return body
    return schema["components"]["schemas"][ref.rsplit("/", 1)[-1]]


def _json_responses(schema):
    """(ruta, método, código, schema-de-respuesta) de cada respuesta JSON 2xx."""
    for path, path_item in schema["paths"].items():
        for method, operation in path_item.items():
            if not isinstance(operation, dict):
                continue
            for code, response in operation.get("responses", {}).items():
                if not str(code).startswith("2"):
                    continue
                media = response.get("content", {}).get("application/json")
                if media and "schema" in media:
                    yield path, method, code, media["schema"]


def test_every_success_response_is_wrapped_in_the_envelope(schema):
    """Ningún 2xx con cuerpo JSON puede devolver el objeto pelado."""
    sin_envolver = [
        f"{method.upper()} {path} -> {code}"
        for path, method, code, body in _json_responses(schema)
        if sorted(_resolve(schema, body).get("properties", {})) != ["data", "meta"]
    ]

    assert sin_envolver == [], (
        "Estas respuestas no siguen el contrato {data, meta}: " + ", ".join(sin_envolver)
    )


def test_paginated_lists_declare_the_real_meta_block(schema):
    componentes = schema["components"]["schemas"]
    paginados = [name for name in componentes if name.startswith("Paginated")]

    assert paginados, "No se generó ningún componente paginado"
    for name in paginados:
        propiedades = componentes[name]["properties"]
        assert sorted(propiedades) == ["data", "meta"], name
        # El formato por defecto de DRF (count/next/previous/results) no se usa.
        assert "results" not in propiedades
        assert sorted(propiedades["meta"]["properties"]) == ["count", "page", "page_size"]


def test_no_operation_is_left_without_a_documented_response(schema):
    """Cada operación declara al menos una respuesta con cuerpo o un 204/205.

    Es el guardarraíl de las APIView anotadas a mano: si alguien añade una
    APIView nueva sin `@extend_schema`, drf-spectacular la deja con
    "No response body" y este test lo detecta.
    """
    sin_documentar = []
    for path, path_item in schema["paths"].items():
        for method, operation in path_item.items():
            if not isinstance(operation, dict):
                continue
            exitosas = {
                code: response
                for code, response in operation.get("responses", {}).items()
                if str(code).startswith("2")
            }
            # 204/205 no llevan cuerpo por definición.
            if any(code in ("204", "205") for code in exitosas):
                continue
            if not any("content" in response for response in exitosas.values()):
                sin_documentar.append(f"{method.upper()} {path}")

    assert sin_documentar == [], (
        "Operaciones sin respuesta documentada (falta @extend_schema): "
        + ", ".join(sin_documentar)
    )


def test_binary_downloads_are_not_enveloped(schema):
    descargas = [
        path
        for path, path_item in schema["paths"].items()
        for operation in path_item.values()
        if isinstance(operation, dict)
        for response in operation.get("responses", {}).values()
        if BINARY_MEDIA in response.get("content", {})
    ]

    assert "/api/v1/media/{id}/download" in descargas
    assert "/api/v1/library/resources/{resource_id}/download" in descargas


def test_the_error_contract_is_documented_on_every_operation(schema):
    referencia = "#/components/schemas/ErrorEnvelope"
    assert "ErrorEnvelope" in schema["components"]["schemas"]

    sin_errores = [
        f"{method.upper()} {path}"
        for path, path_item in schema["paths"].items()
        for method, operation in path_item.items()
        if isinstance(operation, dict)
        and referencia
        not in str(operation.get("responses", {}).get("4XX", {}))
    ]

    assert sin_errores == []


def test_the_capabilities_block_is_part_of_the_documented_current_user(schema):
    propiedades = schema["components"]["schemas"]["CurrentUser"]["properties"]

    assert "capabilities" in propiedades
    assert "effective_scope" in propiedades
    assert "allowed_organizations" in propiedades
