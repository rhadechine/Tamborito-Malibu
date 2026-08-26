"""Admin de Identity.

Se hereda de `django.contrib.auth.admin.UserAdmin` y no de un `ModelAdmin`
plano. Con un ModelAdmin plano el formulario renderizaba *todos* los campos
editables del modelo, con dos consecuencias serias:

1. `password` salía como un input de texto con el hash Argon2 dentro. Si un
   administrador escribía cualquier cosa ahí, se guardaba tal cual como si
   fuera el hash y el usuario quedaba bloqueado para siempre. `UserAdmin` usa
   `ReadOnlyPasswordHashField` y el flujo de cambio de contraseña de Django.
2. `is_staff`, `is_superuser`, `role`, `groups` y `user_permissions` eran
   editables por cualquiera con acceso al admin: un usuario de staff podía
   auto-promoverse a superusuario. Ahora esos campos son de solo lectura
   salvo para un superusuario (`get_readonly_fields`).

`is_active` es de solo lectura a propósito: lo deriva `User.save()` a partir
de `status`, que es la única fuente de verdad del acceso a la cuenta.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm

from .models import User


class UserAdminChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User
        fields = "__all__"
        # El default de Django mapea "username", que este modelo no tiene.
        field_classes = {}


class UserAdminCreationForm(AdminUserCreationForm):
    class Meta(AdminUserCreationForm.Meta):
        model = User
        fields = ("email", "name")
        field_classes = {}


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    form = UserAdminChangeForm
    add_form = UserAdminCreationForm

    ordering = ("email",)
    list_display = ["email", "name", "role", "organization_scope", "status", "is_active"]
    list_filter = ["role", "status", "is_active", "is_staff", "is_superuser"]
    search_fields = ["email", "name"]

    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Perfil", {"fields": ("name", "phone", "city", "bio")}),
        (
            "Acceso",
            {
                "fields": ("status", "is_active"),
                "description": (
                    "`status` decide si la cuenta puede autenticarse. "
                    "`is_active` se deriva de él automáticamente."
                ),
            },
        ),
        (
            "Rol y permisos",
            {
                "fields": (
                    "role",
                    "organization_scope",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
                "description": "Solo un superusuario puede modificar esta sección.",
            },
        ),
        ("Fechas", {"fields": ("last_login", "created_at", "updated_at")}),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "usable_password", "password1", "password2"),
            },
        ),
    )

    readonly_fields = ("is_active", "last_login", "created_at", "updated_at")

    # Campos que conceden privilegios: editarlos es escalar permisos.
    PRIVILEGE_FIELDS = ("role", "is_staff", "is_superuser", "groups", "user_permissions")

    def get_readonly_fields(self, request, obj=None):
        readonly = list(super().get_readonly_fields(request, obj))
        if not request.user.is_superuser:
            readonly += [f for f in self.PRIVILEGE_FIELDS if f not in readonly]
        return tuple(readonly)
