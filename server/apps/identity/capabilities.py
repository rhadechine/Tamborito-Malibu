"""Capacidades del usuario para el panel de administración único.

El frontend tiene **un solo panel** para los tres roles administrativos. Para
decidir qué secciones pinta no debe reimplementar la tabla de roles y
alcances —se desincronizaría en cuanto el backend cambie—, sino leer este
mapa desde `GET /api/v1/auth/me`.

Esto NO es un mecanismo de seguridad: decide qué se *pinta*, no qué se
*puede*. Cada endpoint sigue aplicando su propia permission class, así que
forzar el mapa en el navegador solo consigue un 403. Es defensa en
profundidad, no un reemplazo.

Cada capacidad declara quién la tiene:

- `SCOPED`  cualquier administrador; el backend acota además por
            `organization_scope` (sección 39).
- `SCOPED` + `organization`  solo los administradores cuyo alcance cubre esa
            organización. Aplica a Museo, cuyos modelos no llevan campo
            `organization` y pertenecen por definición a "museum".
- `SUPER`   solo el super_admin: métricas, información financiera, pagos y
            configuración de plataforma, que cruzan las dos organizaciones.
- `ADMIN`   cualquier administrador, sin acotar (no es contenido de una
            organización concreta).

Correspondencia con los endpoints, para que el panel los cablee sin adivinar:

    content.courses        /admin/courses*, /admin/courses/{id}/publish|archive
    content.modules        /admin/courses/{id}/modules, /admin/modules/{id}
    content.lessons        /admin/modules/{id}/lessons, /admin/lessons/{id}
    content.pages          /admin/pages*, /admin/page-sections/{id}
    content.library        /admin/library/resources*
    content.museum         /admin/museum/*
    content.media          /admin/media/{id}
    learning.enrollments   /admin/enrollments*, /admin/students/{id}/enrollments
    learning.evidences     /admin/evidences*
    certificates.revoke    /admin/certificates/{id}/revoke
    finance.reports        /admin/reports/*
    finance.orders         /admin/orders*
    finance.donations      /admin/donations*
    finance.payments       /admin/payments/intents/{id}/refund, /payments/intents/{id}
    platform.settings      /admin/settings
    users.manage           /admin/users
    users.manage_admins    /admin/users/{id}/status sobre otra cuenta admin
    notifications.send     /admin/notifications

Añadir una capacidad nueva aquí no rompe un panel ya desplegado: las claves
que no conoce simplemente no las usa.
"""

from common.scopes import MUSEUM, allowed_organizations

SCOPED = "scoped"
SUPER = "super"
ADMIN = "admin"

# nombre -> (nivel, organización requerida o None)
CAPABILITIES = {
    # Contenido — acotado por organization_scope
    "content.courses": (SCOPED, None),
    "content.modules": (SCOPED, None),
    "content.lessons": (SCOPED, None),
    "content.pages": (SCOPED, None),
    "content.library": (SCOPED, None),
    "content.museum": (SCOPED, MUSEUM),
    "content.media": (SCOPED, None),
    # Formación
    "learning.enrollments": (SCOPED, None),
    "learning.evidences": (SCOPED, None),
    "certificates.revoke": (SCOPED, None),
    # Finanzas y plataforma — administrador general del ecosistema
    "finance.reports": (SUPER, None),
    "finance.orders": (SUPER, None),
    "finance.donations": (SUPER, None),
    "finance.payments": (SUPER, None),
    "platform.settings": (SUPER, None),
    # Operación general
    "users.manage": (ADMIN, None),
    "users.manage_admins": (SUPER, None),
    "notifications.send": (ADMIN, None),
}


def capabilities_for(user) -> dict:
    """Mapa {capacidad: bool} para `user`. Un no-administrador no tiene ninguna."""
    if not user or not getattr(user, "is_authenticated", False) or not user.is_admin:
        return dict.fromkeys(CAPABILITIES, False)

    reach = allowed_organizations(user)
    is_super = user.is_super_admin

    resolved = {}
    for name, (level, organization) in CAPABILITIES.items():
        if level == SUPER:
            resolved[name] = is_super
        elif organization is not None:
            resolved[name] = organization in reach
        else:
            resolved[name] = True
    return resolved
