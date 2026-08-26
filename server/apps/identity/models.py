"""
Split 02 — Identity. Custom User Model (sección 13 del documento).
"""

from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def get_by_natural_key(self, email):
        """Login case-insensitive (sección 13).

        Django resuelve el login siempre por match exacto de
        `USERNAME_FIELD`; sin este override, `Juan@x.com` y `juan@x.com`
        pasan a ser la MISMA cuenta a nivel de datos (`User.save()` ya
        normaliza el email a minúsculas) pero solo una de las dos formas de
        escribirla permitiría iniciar sesión.
        """
        return self.get(**{f"{self.model.USERNAME_FIELD}__iexact": email})

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio.")
        user = self.model(email=self.normalize_email(email), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", User.Role.SUPER_ADMIN)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        CLIENT = "client", "Client"
        ADMIN_FOUNDATION = "admin_foundation", "Admin Foundation"
        ADMIN_MUSEUM = "admin_museum", "Admin Museum"
        SUPER_ADMIN = "super_admin", "Super Admin"

    class OrganizationScope(models.TextChoices):
        FOUNDATION = "foundation", "Foundation"
        MUSEUM = "museum", "Museum"
        BOTH = "both", "Both"

    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        INACTIVE = "inactive", "Inactive"
        SUSPENDED = "suspended", "Suspended"

    ADMIN_ROLES = (Role.ADMIN_FOUNDATION, Role.ADMIN_MUSEUM, Role.SUPER_ADMIN)

    email = models.EmailField(unique=True)
    name = models.CharField(max_length=150)
    role = models.CharField(max_length=32, choices=Role.choices, default=Role.CLIENT)
    organization_scope = models.CharField(
        max_length=16, choices=OrganizationScope.choices, blank=True
    )
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    phone = models.CharField(max_length=32, blank=True)
    city = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    def __str__(self):
        return self.email

    def save(self, *args, **kwargs):
        """`status` es la única fuente de verdad del acceso a la cuenta.

        Django y SimpleJWT solo consultan `is_active` para decidir si una
        cuenta puede autenticarse (`ModelBackend.user_can_authenticate` y
        `JWTAuthentication.get_user`). Sin esta sincronización, marcar a un
        usuario como `suspended`/`inactive` desde el panel admin no tenía
        ningún efecto: seguía pudiendo iniciar sesión. Ver sección 13.
        """
        self.is_active = self.status == self.Status.ACTIVE

        # Email en minúsculas siempre, sin importar la vía de escritura
        # (registro, `createsuperuser`, Django Admin, un fixture). Antes solo
        # `normalize_email` bajaba el dominio: "Juan@x.com" y "juan@x.com"
        # quedaban como dos cuentas distintas ante la restricción `unique=True`
        # del campo, que en Postgres es sensible a mayúsculas.
        if self.email:
            self.email = self.email.strip().lower()

        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            update_fields = set(update_fields)
            if "status" in update_fields:
                update_fields.add("is_active")
            kwargs["update_fields"] = update_fields

        super().save(*args, **kwargs)

    @property
    def is_admin(self):
        return self.role in self.ADMIN_ROLES

    @property
    def is_super_admin(self):
        """Administrador general del ecosistema (Fundación + Museo).

        Es el único rol con visión financiera y de métricas consolidada de las
        dos organizaciones; los admins de Fundación y Museo administran
        únicamente el contenido de su propio alcance (sección 39).
        """
        return self.role == self.Role.SUPER_ADMIN
