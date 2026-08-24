from rest_framework import serializers

from common.permissions import OrganizationScopedSerializerMixin

from .models import Page, PageSection


class PageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSection
        fields = ["id", "page", "type", "title", "subtitle", "body", "media", "position", "metadata_json"]
        read_only_fields = ["id", "page"]


class PagePublicSerializer(serializers.ModelSerializer):
    sections = PageSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = ["slug", "organization", "title", "seo_title", "seo_description", "sections"]


class PageAdminSerializer(OrganizationScopedSerializerMixin, serializers.ModelSerializer):
    sections = PageSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = [
            "id", "slug", "organization", "title", "status",
            "seo_title", "seo_description", "sections", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
