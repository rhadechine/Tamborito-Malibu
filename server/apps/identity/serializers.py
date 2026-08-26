from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from common.scopes import allowed_organizations, effective_scope

from .capabilities import capabilities_for

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id", "email", "name", "role", "organization_scope",
            "status", "phone", "city", "bio", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "email", "role", "status", "created_at", "updated_at"]


class CurrentUserSerializer(UserSerializer):
    """`/auth/me` y `/users/me`.

    Añade el alcance ya resuelto y el mapa de capacidades para que el panel de
    administración único del frontend decida qué secciones pinta sin duplicar
    la tabla de roles del backend. Ver `apps.identity.capabilities`.

    No se añade a `UserSerializer` a secas porque ese se usa también en
    `/admin/users`, donde repetir el bloque por cada fila no aporta nada.
    """

    effective_scope = serializers.SerializerMethodField()
    allowed_organizations = serializers.SerializerMethodField()
    capabilities = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            "effective_scope",
            "allowed_organizations",
            "capabilities",
        ]

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_effective_scope(self, user):
        return effective_scope(user)

    @extend_schema_field(serializers.ListField(child=serializers.CharField()))
    def get_allowed_organizations(self, user):
        return sorted(allowed_organizations(user))

    @extend_schema_field(serializers.DictField(child=serializers.BooleanField()))
    def get_capabilities(self, user):
        return capabilities_for(user)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["email", "password", "name", "phone", "city", "bio"]
        # El `UniqueValidator` que ModelSerializer generaría automáticamente
        # para `email` compara con match exacto; se sustituye por
        # `validate_email` (más abajo) para que la comparación sea
        # case-insensitive, igual que la unicidad real que aplica `User.save()`.
        extra_kwargs = {"email": {"validators": []}}

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("Ya existe una cuenta registrada con ese correo.")
        return normalized

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Contraseña actual incorrecta.")
        return value

    def validate_new_password(self, value):
        validate_password(value, user=self.context["request"].user)
        return value


class AdminUserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["status"]
