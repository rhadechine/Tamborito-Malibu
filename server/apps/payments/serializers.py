from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from .models import PaymentIntent


class CreatePaymentIntentSerializer(serializers.Serializer):
    order_id = serializers.IntegerField(required=False)
    donation_id = serializers.IntegerField(required=False)

    def validate(self, attrs):
        if bool(attrs.get("order_id")) == bool(attrs.get("donation_id")):
            raise serializers.ValidationError("Debe indicar exactamente uno: order_id o donation_id.")
        return attrs


class PaymentIntentSerializer(serializers.ModelSerializer):
    checkout = serializers.SerializerMethodField()

    class Meta:
        model = PaymentIntent
        fields = [
            "id", "provider", "method", "amount", "currency", "status",
            "reference_code", "redirect_url", "checkout", "created_at", "updated_at",
        ]

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_checkout(self, intent):
        return self.context.get("checkout")
