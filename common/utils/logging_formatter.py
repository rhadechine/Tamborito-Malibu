"""Formatter de logging estructurado en JSON (sección 47)."""

import json
import logging
import re
from datetime import UTC, datetime

RESERVED_LOG_RECORD_ATTRS = frozenset(logging.LogRecord("", 0, "", 0, "", None, None).__dict__)

# Ningún `logger.info(..., extra={...})` del código actual pasa contraseñas o
# tokens hoy, pero el formatter no tiene forma de saberlo de antemano: vuelca
# lo que sea que le llegue en `extra`. Esta es la última línea de defensa
# contra que un `extra` añadido más adelante (o un payload de proveedor
# externo reenviado tal cual, como el webhook de PayU) termine escribiendo un
# secreto en texto plano en los logs. Se aplica por nombre de clave, en
# cualquier nivel de anidamiento — no por tipo de dato, así que no hace falta
# enumerar cada campo sensible existente, basta con el patrón del nombre.
_SENSITIVE_KEY_PATTERN = re.compile(
    r"password|passwd|secret|token|authorization|api[_-]?key|card[_-]?number|cvv|ssn",
    re.IGNORECASE,
)
_REDACTED = "[REDACTED]"


def _redact(value, key_hint=""):
    if isinstance(value, dict):
        return {key: _redact(nested, key) for key, nested in value.items()}
    if isinstance(value, (list, tuple)):
        return [_redact(item, key_hint) for item in value]
    if _SENSITIVE_KEY_PATTERN.search(key_hint):
        return _REDACTED
    return value


class StructuredFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "event": record.getMessage(),
        }

        extras = {
            key: _redact(value, key)
            for key, value in record.__dict__.items()
            if key not in RESERVED_LOG_RECORD_ATTRS
        }
        payload.update(extras)

        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)

        return json.dumps(payload, default=str)
