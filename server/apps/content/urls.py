from django.urls import path

from .views import (
    AdminPageListCreateView,
    AdminPageSectionCreateView,
    AdminPageSectionDetailView,
    AdminPageUpdateView,
    PagePublicView,
)

urlpatterns = [
    path("pages/<slug:slug>", PagePublicView.as_view(), name="page-public"),
    path("admin/pages", AdminPageListCreateView.as_view(), name="admin-pages"),
    path("admin/pages/<int:pk>", AdminPageUpdateView.as_view(), name="admin-page-detail"),
    path("admin/pages/<int:page_id>/sections", AdminPageSectionCreateView.as_view(), name="admin-page-sections"),
    path("admin/page-sections/<int:pk>", AdminPageSectionDetailView.as_view(), name="admin-page-section-detail"),
]
