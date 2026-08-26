from rest_framework import serializers

from .models import CollectionGroup, MuseumExhibition, MuseumPiece


class CollectionGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionGroup
        fields = ["id", "title", "description", "slug", "position"]


class MuseumPieceListSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuseumPiece
        fields = ["id", "collection_group", "name", "slug", "material", "period_label", "main_image_media"]


class MuseumPieceDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuseumPiece
        fields = [
            "id", "collection_group", "name", "slug", "material", "history", "description",
            "conservation_status", "origin_context", "period_label", "main_image_media",
        ]


class MuseumExhibitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuseumExhibition
        fields = ["id", "title", "description", "type", "start_date", "end_date"]


# --- Admin ---


class CollectionGroupAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionGroup
        fields = ["id", "title", "description", "slug", "status", "position"]
        read_only_fields = ["id"]


class MuseumPieceAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuseumPiece
        fields = [
            "id", "collection_group", "name", "slug", "material", "history", "description",
            "conservation_status", "origin_context", "period_label", "main_image_media",
            "status", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class MuseumExhibitionAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = MuseumExhibition
        fields = ["id", "title", "description", "type", "start_date", "end_date", "status"]
        read_only_fields = ["id"]
