from django.urls import path

from .views import (
    AdminLibraryResourceDetailView,
    AdminLibraryResourceListView,
    LibraryDownloadUrlView,
    LibraryDownloadView,
    LibraryResourceDetailView,
    LibraryResourceListView,
    ResourceViewLogView,
)

urlpatterns = [
    path("library/resources", LibraryResourceListView.as_view(), name="library-resources"),
    path("library/resources/<slug:slug>", LibraryResourceDetailView.as_view(), name="library-resource-detail"),
    path(
        "library/resources/<int:resource_id>/download-url",
        LibraryDownloadUrlView.as_view(),
        name="library-resource-download-url",
    ),
    path(
        "library/resources/<int:resource_id>/download",
        LibraryDownloadView.as_view(),
        name="library-resource-download",
    ),
    path(
        "library/resources/<int:resource_id>/view-log",
        ResourceViewLogView.as_view(),
        name="library-resource-view-log",
    ),
    path("admin/library/resources", AdminLibraryResourceListView.as_view(), name="admin-library-resources"),
    path(
        "admin/library/resources/<int:pk>",
        AdminLibraryResourceDetailView.as_view(),
        name="admin-library-resource-detail",
    ),
]
