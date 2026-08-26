from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from common.permissions import OrganizationScopePermission, assert_scope
from common.responses.envelope import success

from .models import Certificate
from .serializers import CertificateSerializer, CertificateVerifySerializer

# --- Estudiante ---


class StudentCertificateListView(generics.ListAPIView):
    serializer_class = CertificateSerializer

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user).select_related("course")


class StudentCertificateDetailView(generics.RetrieveAPIView):
    serializer_class = CertificateSerializer

    def get_queryset(self):
        return Certificate.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)


# --- Público ---


@extend_schema(responses={200: CertificateVerifySerializer})
class CertificateVerifyView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "verify"

    def get(self, request, code):
        certificate = get_object_or_404(Certificate, code=code)
        return success(CertificateVerifySerializer(certificate).data)


# --- Admin ---


@extend_schema(request=None, responses={200: CertificateSerializer})
class AdminCertificateRevokeView(APIView):
    permission_classes = [OrganizationScopePermission]

    def post(self, request, certificate_id):
        certificate = get_object_or_404(
            Certificate.objects.select_related("course"), pk=certificate_id
        )
        # Un certificado pertenece a la organizacion de su curso.
        assert_scope(request.user, certificate.course.organization)
        certificate.revoked_at = timezone.now()
        certificate.save(update_fields=["revoked_at"])
        return success(CertificateSerializer(certificate).data)
