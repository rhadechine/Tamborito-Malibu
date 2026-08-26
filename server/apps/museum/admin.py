from django.contrib import admin

from .models import CollectionGroup, MuseumExhibition, MuseumPiece


@admin.register(CollectionGroup)
class CollectionGroupAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "status", "position"]
    list_filter = ["status"]


@admin.register(MuseumPiece)
class MuseumPieceAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "collection_group", "status", "updated_at"]
    list_filter = ["status", "collection_group"]
    search_fields = ["name", "slug"]


@admin.register(MuseumExhibition)
class MuseumExhibitionAdmin(admin.ModelAdmin):
    list_display = ["title", "type", "start_date", "end_date", "status"]
    list_filter = ["status", "type"]
