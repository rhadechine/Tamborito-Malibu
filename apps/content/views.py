from rest_framework import generics, permissions

from common.permissions import (
    OrganizationScopedQuerysetMixin,
    OrganizationScopePermission,
    assert_scope,
)
from common.responses.envelope import success

from .models import Page, PageSection
from .serializers import (
    PageAdminSerializer,
    PagePublicSerializer,
    PageSectionSerializer,
)


class PagePublicView(generics.RetrieveAPIView):
    queryset = Page.objects.filter(status=Page.Status.PUBLISHED)
    serializer_class = PagePublicSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)


class AdminPageListCreateView(OrganizationScopedQuerysetMixin, generics.ListCreateAPIView):
    queryset = Page.objects.all().order_by("-created_at")
    serializer_class = PageAdminSerializer
    permission_classes = [OrganizationScopePermission]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        page = serializer.save()
        return success(self.get_serializer(page).data, status=201)


class AdminPageUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Page.objects.all()
    serializer_class = PageAdminSerializer
    permission_classes = [OrganizationScopePermission]
    http_method_names = ["get", "patch"]

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        page = serializer.save()
        return success(self.get_serializer(page).data)


class AdminPageSectionCreateView(generics.CreateAPIView):
    serializer_class = PageSectionSerializer
    permission_classes = [OrganizationScopePermission]

    def create(self, request, *args, **kwargs):
        # Una seccion hereda la organizacion de su pagina.
        page = generics.get_object_or_404(Page, pk=self.kwargs["page_id"])
        assert_scope(request.user, page.organization)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        section = serializer.save(page=page)
        return success(self.get_serializer(section).data, status=201)


class AdminPageSectionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = PageSection.objects.all()
    serializer_class = PageSectionSerializer
    permission_classes = [OrganizationScopePermission]
    organization_source = "page.organization"
    http_method_names = ["get", "patch", "delete"]

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        section = serializer.save()
        return success(self.get_serializer(section).data)
