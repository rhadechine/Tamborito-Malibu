"""
Request ID middleware — Split 01 (Foundation).

Asigna un identificador único a cada request entrante (o respeta uno ya
provisto por un proxy/upstream vía el header `X-Request-ID`), lo expone en
`request.request_id` para que logging/observabilidad lo puedan usar, y lo
devuelve en la respuesta.
"""

import re
import uuid

REQUEST_ID_HEADER = "X-Request-ID"

# El id se refleja en la respuesta y se escribe tal cual en cada línea de log
# estructurado de la request (`common.utils.logging_formatter`). Sin
# restringir forma y tamaño, un cliente podría mandar un valor arbitrariamente
# largo (inflando cada línea de log) o con caracteres fuera de lo esperado
# para un identificador de correlación. Django ya impide inyectar saltos de
# línea en la cabecera de respuesta (`BadHeaderError`), pero eso no cubre
# tamaño ni el resto de bytes de control; se valida aquí en vez de confiar
# únicamente en esa última línea de defensa.
_VALID_REQUEST_ID = re.compile(r"^[A-Za-z0-9._-]{1,128}$")


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        incoming = request.headers.get(REQUEST_ID_HEADER)
        if incoming and _VALID_REQUEST_ID.match(incoming):
            request.request_id = incoming
        else:
            request.request_id = str(uuid.uuid4())

        response = self.get_response(request)
        response[REQUEST_ID_HEADER] = request.request_id
        return response
