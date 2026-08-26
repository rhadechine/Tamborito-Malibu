"""Bus de eventos de dominio en memoria (sección 28).

Cualquier dominio publica con `dispatch(nombre, **payload)`. Los dominios
"reactivos" del nivel 6 (Notifications, Certificates, Reports — sección 50)
se suscriben en su `AppConfig.ready()` en vez de que los publicadores los
importen: así Payments/Learning/Identity nunca importan Notifications
directamente, lo cual violaría la jerarquía de importación de la sección 50
(un dominio inferior no puede depender de uno superior). Vive en `common`
(nivel 0) porque es el único nivel que todos los dominios pueden importar.

Es intencionalmente síncrono e in-process — RabbitMQ/Celery (sección 29)
sigue siendo la ruta para desacoplar de verdad cuando el volumen lo
justifique; esto resuelve el mismo contrato (nombre de evento + payload) sin
esa infraestructura todavía.
"""

import logging
from collections import defaultdict

logger = logging.getLogger("tamborito.events")

_subscribers = defaultdict(list)


def subscribe(event_name, handler):
    _subscribers[event_name].append(handler)


def dispatch(event_name, **payload):
    for handler in _subscribers[event_name]:
        try:
            handler(**payload)
        except Exception:
            logger.exception("event_handler_failed", extra={"event": event_name})
