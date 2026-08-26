from django.contrib import admin

from .models import LibraryResource, ResourceAccessLog


@admin.register(LibraryResource)
class LibraryResourceAdmin(admin.ModelAdmin):
    list_display = ["title", "slug", "type", "access", "organization", "status", "published_at"]
    list_filter = ["type", "access", "organization", "status"]
    search_fields = ["title", "slug", "author"]


@admin.register(ResourceAccessLog)
class ResourceAccessLogAdmin(admin.ModelAdmin):
    list_display = ["resource", "user", "action", "created_at"]
    list_filter = ["action"]
