"""Permission classes — secciones 13 y 39.

`IsAdminRole` responde "¿es administrador?"; `OrganizationScopePermission`
añade la segunda mitad que pedía la sección 39: "¿y de *esta* organización?".
La lógica de alcance vive en `common.scopes`.
"""

from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission

from common.scopes import allowed_organizations, resolve_organization, scope_covers

SCOPE_DENIED_MESSAGE = "Tu alcance organizacional no incluye este recurso."


class IsAdminRole(BasePermission):
    """Roles admin_foundation, admin_museum, super_admin — sección 13."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin)


class IsSuperAdmin(BasePermission):
    """Solo super_admin — el administrador general de Fundación + Museo.

    Se reserva para lo que cruza las dos organizaciones y no puede acotarse
    por `organization_scope`: métricas consolidadas, información financiera y
    gestión de pagos. Un admin de Fundación o de Museo administra el contenido
    de su alcance, pero no ve la facturación del ecosistema completo.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and getattr(request.user, "is_super_admin", False)
        )


class OrganizationScopePermission(IsAdminRole):
    """Rol admin **y** alcance organizacional sobre el objeto.

    La vista declara de dónde sale la organización:

    - `organization = "museum"` cuando el dominio entero pertenece a una sola
      organización (Museum) y la comprobación puede hacerse antes de tocar la
      base de datos.
    - `organization_source = "course.organization"` para leerla del objeto,
      admitiendo rutas anidadas.

    Ojo: DRF solo invoca `has_object_permission()` a través de `get_object()`.
    Las vistas que resuelven el objeto por su cuenta (o que operan sobre un
    padre, como crear un módulo dentro de un curso) deben llamar a
    `assert_scope()` explícitamente.
    """

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        fixed = getattr(view, "organization", None)
        if fixed is None:
            return True
        return scope_covers(request.user, fixed)

    def has_object_permission(self, request, view, obj):
        fixed = getattr(view, "organization", None)
        if fixed is not None:
            # El dominio entero pertenece a una organización (Museum): sus
            # modelos no llevan campo `organization` que consultar.
            return scope_covers(request.user, fixed)
        source = getattr(view, "organization_source", "organization")
        return scope_covers(request.user, resolve_organization(obj, source))


def assert_scope(user, organization):
    """Corta con 403 si el alcance del usuario no cubre `organization`."""
    if not scope_covers(user, organization):
        raise PermissionDenied(SCOPE_DENIED_MESSAGE)


class OrganizationScopedQuerysetMixin:
    """Restringe los listados admin a las organizaciones del usuario.

    Un administrador de Museo no debería ni ver el contenido de Fundación en
    su panel, no solo no poder editarlo.
    """

    organization_lookup = "organization"

    def get_queryset(self):
        queryset = super().get_queryset()
        return queryset.filter(
            **{f"{self.organization_lookup}__in": allowed_organizations(self.request.user)}
        )


class OrganizationScopedSerializerMixin:
    """Impide crear o mover un objeto hacia una organización fuera de alcance.

    Una permission class no ve el cuerpo del request, así que el caso "crear
    un curso de Fundación siendo admin de Museo" —y el de moverlo con un
    PATCH— se valida aquí.
    """

    organization_field = "organization"

    def validate(self, attrs):
        attrs = super().validate(attrs)
        request = self.context.get("request")
        if request is None:
            return attrs

        organization = attrs.get(self.organization_field)
        if organization is None and self.instance is not None:
            organization = getattr(self.instance, self.organization_field, None)

        assert_scope(request.user, organization)
        return attrs
