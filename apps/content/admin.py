from django.contrib import admin

from .models import Page, PageSection


class PageSectionInline(admin.TabularInline):
    model = PageSection
    extra = 0


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ["slug", "organization", "title", "status"]
    list_filter = ["organization", "status"]
    search_fields = ["slug", "title"]
    inlines = [PageSectionInline]
