from django.contrib import admin

from .models import PaymentEvent, PaymentIntent


class PaymentEventInline(admin.TabularInline):
    model = PaymentEvent
    extra = 0
    readonly_fields = ["provider_event_id", "event_type", "payload_json", "received_at"]


@admin.register(PaymentIntent)
class PaymentIntentAdmin(admin.ModelAdmin):
    list_display = ["reference_code", "provider", "amount", "currency", "status", "created_at"]
    list_filter = ["provider", "status"]
    search_fields = ["reference_code", "provider_reference"]
    inlines = [PaymentEventInline]
