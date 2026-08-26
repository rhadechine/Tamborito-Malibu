from django.contrib import admin

from .models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ["id", "donor_name", "organization_target", "amount", "status", "created_at"]
    list_filter = ["organization_target", "status"]
    search_fields = ["donor_name", "donor_email"]
