from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from common.permissions import OrganizationScopedSerializerMixin

from .models import LibraryResource


class LibraryResourceSerializer(serializers.ModelSerializer):
    """Serializer público: lista y detalle abiertos (`AllowAny`).

    `external_url` solo se expone en recursos `public`. Antes se incluía
    siempre, así que el enlace de un recurso `enrolled_only`/`purchased_only`
    quedaba visible sin sesión y se podía consumir sin pasar nunca por
    `download-url` —la única vía donde se verifica el acceso—. `media` nunca
    se expone aquí por la misma razón.
    """

    external_url = serializers.SerializerMethodField()

    class Meta:
        model = LibraryResource
        fields = [
            "id", "title", "slug", "description", "category", "type", "access",
            "organization", "course", "external_url", "author", "published_at",
        ]

    @extend_schema_field(serializers.CharField(allow_blank=True))
    def get_external_url(self, resource):
        if resource.access == LibraryResource.Access.PUBLIC:
            return resource.external_url
        return ""


class LibraryResourceAdminSerializer(OrganizationScopedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = LibraryResource
        fields = [
            "id", "title", "slug", "description", "category", "type", "access", "organization",
            "media", "course", "external_url", "author", "published_at", "status",
        ]
        read_only_fields = ["id"]
