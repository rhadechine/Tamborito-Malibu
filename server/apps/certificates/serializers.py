from rest_framework import serializers

from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source="course.title", read_only=True)

    class Meta:
        model = Certificate
        fields = ["id", "code", "course", "course_title", "issued_at", "revoked_at", "pdf_media"]


class CertificateVerifySerializer(serializers.ModelSerializer):
    holder_name = serializers.CharField(source="user.name", read_only=True)
    course_title = serializers.CharField(source="course.title", read_only=True)
    valid = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = ["code", "holder_name", "course_title", "issued_at", "revoked_at", "valid"]

    def get_valid(self, certificate):
        return certificate.revoked_at is None
