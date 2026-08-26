from django.contrib import admin

from .models import PlatformSettings


@admin.register(PlatformSettings)
class PlatformSettingsAdmin(admin.ModelAdmin):
    list_display = ["platform_name", "maintenance_mode", "updated_at"]

    def has_add_permission(self, request):
        # Singleton: no se crean filas nuevas desde el admin.
        return not PlatformSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False
