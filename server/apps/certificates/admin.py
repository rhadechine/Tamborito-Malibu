from django.contrib import admin

from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ["code", "user", "course", "issued_at", "revoked_at"]
    list_filter = ["revoked_at"]
    search_fields = ["code"]
