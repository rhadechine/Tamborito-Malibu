from django.conf import settings
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from django.urls import reverse
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import generics, serializers
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from common.permissions import (
    OrganizationScopedQuerysetMixin,
    OrganizationScopePermission,
)
from common.responses.envelope import error, success
from common.schema import UrlResponseSerializer

from . import services
from .models import LibraryResource, ResourceAccessLog
from .serializers import LibraryResourceAdminSerializer, LibraryResourceSerializer


def _check_access(resource, user):
    """Resuelve los cuatro access levels de la sección 21.

    `private` = requiere sesión (cualquier usuario autenticado); es el nivel
    "no indexable / no anónimo", no un nivel de permiso individual.

    `enrolled_only` / `purchased_only` se resuelven contra `CourseAccessGrant`.
    Si el recurso no tiene curso asociado la comprobación es imposible, y
    antes eso se resolvía **abriendo** el recurso a cualquier usuario
    autenticado: un recurso marcado `purchased_only` mal configurado quedaba
    accesible sin haber comprado nada. Ahora falla cerrado.
    """
    if resource.access == LibraryResource.Access.PUBLIC:
        return True
    if not (user and user.is_authenticated):
        return False
    if user.is_admin:
        return True
    if resource.access == LibraryResource.Access.PRIVATE:
        return True
    if resource.course_id is None:
        return False
    require_purchase = resource.access == LibraryResource.Access.PURCHASED_ONLY
    return services.has_course_access(user, resource.course, require_purchase=require_purchase)


class LibraryResourceListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = LibraryResourceSerializer
    queryset = LibraryResource.objects.filter(status=LibraryResource.Status.PUBLISHED).order_by("-published_at")


class LibraryResourceDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = LibraryResourceSerializer
    lookup_field = "slug"
    queryset = LibraryResource.objects.filter(status=LibraryResource.Status.PUBLISHED)


@extend_schema(responses={200: UrlResponseSerializer})
class LibraryDownloadUrlView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, resource_id):
        resource = get_object_or_404(LibraryResource, pk=resource_id, status=LibraryResource.Status.PUBLISHED)
        if not _check_access(resource, request.user):
            raise PermissionDenied("No tienes acceso a este recurso.")

        if resource.media_id:
            if settings.AWS_ACCESS_KEY_ID:
                # S3: storage.url() ya viene firmada y con expiración.
                return success({"url": resource.media.file.url})
            # Almacenamiento local: la ruta de MEDIA_URL es pública y adivinable,
            # así que se entrega el endpoint que vuelve a verificar el acceso.
            return success(
                {"url": request.build_absolute_uri(reverse("library-resource-download", args=[resource.pk]))}
            )
        if resource.external_url:
            return success({"url": resource.external_url})
        return error("NOT_FOUND", "Este recurso no tiene un archivo o enlace asociado.", status=404)


@extend_schema(
    responses={
        (200, "application/octet-stream"): OpenApiTypes.BINARY,
        403: OpenApiResponse(description="Sin acceso a este recurso."),
    }
)
class LibraryDownloadView(APIView):
    """Entrega los bytes del recurso re-verificando el access level.

    No se puede reutilizar `/media/{id}/download`: ese endpoint autoriza por
    propietario del MediaAsset (subido por un admin), no por inscripción o
    compra del curso, que es el criterio de Library.
    """

    permission_classes = [AllowAny]

    def get(self, request, resource_id):
        resource = get_object_or_404(LibraryResource, pk=resource_id, status=LibraryResource.Status.PUBLISHED)
        if not _check_access(resource, request.user):
            raise PermissionDenied("No tienes acceso a este recurso.")
        if not resource.media_id:
            return error("NOT_FOUND", "Este recurso no tiene un archivo asociado.", status=404)

        media = resource.media
        return FileResponse(
            media.file.open("rb"),
            as_attachment=True,
            filename=media.original_name or media.file_name,
            content_type=media.mime_type or "application/octet-stream",
        )


@extend_schema(
    request=inline_serializer(
        "ResourceViewLogRequest",
        fields={"action": serializers.CharField(required=False, default="view")},
    ),
    responses={201: OpenApiTypes.OBJECT},
)
class ResourceViewLogView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, resource_id):
        resource = get_object_or_404(LibraryResource, pk=resource_id, status=LibraryResource.Status.PUBLISHED)
        user = request.user if request.user.is_authenticated else None
        ResourceAccessLog.objects.create(
            user=user, resource=resource, action=request.data.get("action", "view")
        )
        return success({}, status=201)


# --- Admin ---


class AdminLibraryResourceListView(OrganizationScopedQuerysetMixin, generics.ListCreateAPIView):
    permission_classes = [OrganizationScopePermission]
    serializer_class = LibraryResourceAdminSerializer
    queryset = LibraryResource.objects.all().order_by("-published_at")


class AdminLibraryResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [OrganizationScopePermission]
    serializer_class = LibraryResourceAdminSerializer
    queryset = LibraryResource.objects.all()
