"""Alcance organizacional — sección 39 del documento de arquitectura.

El documento señala como riesgo importante la falta de claridad entre los
roles de Fundación y Museo, y pide que la separación de permisos considere
`role` **+** `organization_scope`. Hasta ahora solo existía `IsAdminRole`:
cualquier administrador podía editar el contenido de la otra organización.

Reglas:

- El alcance efectivo de un usuario es su `organization_scope` explícito; si
  está en blanco se deriva del rol (`admin_foundation` -> foundation,
  `admin_museum` -> museum, `super_admin` -> both). Así una cuenta creada sin
  scope no queda ni bloqueada ni con acceso total por accidente.
- Un alcance alcanza a su propia organización y a la compartida (`both`): el
  contenido marcado `both` es común a las dos organizaciones y cualquiera de
  los dos equipos lo mantiene.
- Un objeto sin organización declarada es un dato incompleto: solo un alcance
  total puede tocarlo, para que un super_admin pueda corregirlo.

Vive en `common` (nivel 0) porque lo consumen dominios de varios niveles.
"""

FOUNDATION = "foundation"
MUSEUM = "museum"
BOTH = "both"

_SCOPE_REACH = {
    FOUNDATION: frozenset({FOUNDATION, BOTH}),
    MUSEUM: frozenset({MUSEUM, BOTH}),
    BOTH: frozenset({FOUNDATION, MUSEUM, BOTH}),
}

_FULL_REACH = _SCOPE_REACH[BOTH]

_ROLE_DEFAULT_SCOPE = {
    "admin_foundation": FOUNDATION,
    "admin_museum": MUSEUM,
    "super_admin": BOTH,
}


def effective_scope(user):
    """Alcance del usuario: el explícito, o el derivado de su rol."""
    if not user or not getattr(user, "is_authenticated", False):
        return None
    return getattr(user, "organization_scope", "") or _ROLE_DEFAULT_SCOPE.get(
        getattr(user, "role", None)
    )


def allowed_organizations(user) -> frozenset:
    """Organizaciones sobre las que el usuario puede operar."""
    return _SCOPE_REACH.get(effective_scope(user), frozenset())


def scope_covers(user, organization) -> bool:
    reach = allowed_organizations(user)
    if not organization:
        return reach == _FULL_REACH
    return organization in reach


def resolve_organization(obj, path="organization"):
    """Lee la organización de `obj` siguiendo una ruta con puntos.

    Los módulos y lecciones no tienen organización propia: la heredan del
    curso (`"course.organization"`, `"module.course.organization"`).
    """
    for part in path.split("."):
        obj = getattr(obj, part, None)
        if obj is None:
            return None
    return obj
