from django.urls import path

from .views import (
    AdminCertificateRevokeView,
    CertificateVerifyView,
    StudentCertificateDetailView,
    StudentCertificateListView,
)

urlpatterns = [
    path("student/certificates", StudentCertificateListView.as_view(), name="student-certificates"),
    path(
        "student/certificates/<int:pk>",
        StudentCertificateDetailView.as_view(),
        name="student-certificate-detail",
    ),
    path("certificates/verify/<str:code>", CertificateVerifyView.as_view(), name="certificate-verify"),
    path(
        "admin/certificates/<int:certificate_id>/revoke",
        AdminCertificateRevokeView.as_view(),
        name="admin-certificate-revoke",
    ),
]
