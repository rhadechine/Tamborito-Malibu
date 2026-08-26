from rest_framework import serializers

from .models import Donation


class DonationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ["donor_name", "donor_email", "organization_target", "amount", "currency", "message"]


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = [
            "id", "donor_name", "donor_email", "organization_target", "amount", "currency",
            "message", "transaction_reference", "status", "created_at", "confirmed_at",
        ]
        read_only_fields = [f for f in fields if f not in ("transaction_reference", "status")]


class DonationAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = ["status", "transaction_reference"]
