from django.urls import path

from .views import (
    AdminCollectionGroupDetailView,
    AdminCollectionGroupListView,
    AdminMuseumExhibitionDetailView,
    AdminMuseumExhibitionListView,
    AdminMuseumPieceDetailView,
    AdminMuseumPieceListView,
    CollectionGroupListView,
    MuseumExhibitionListView,
    MuseumPieceDetailView,
    MuseumPieceListView,
)

urlpatterns = [
    path("museum/collection-groups", CollectionGroupListView.as_view(), name="museum-collection-groups"),
    path("museum/pieces", MuseumPieceListView.as_view(), name="museum-pieces"),
    path("museum/pieces/<slug:slug>", MuseumPieceDetailView.as_view(), name="museum-piece-detail"),
    path("museum/exhibitions", MuseumExhibitionListView.as_view(), name="museum-exhibitions"),
    path(
        "admin/museum/collection-groups",
        AdminCollectionGroupListView.as_view(),
        name="admin-museum-collection-groups",
    ),
    path(
        "admin/museum/collection-groups/<int:pk>",
        AdminCollectionGroupDetailView.as_view(),
        name="admin-museum-collection-group-detail",
    ),
    path("admin/museum/pieces", AdminMuseumPieceListView.as_view(), name="admin-museum-pieces"),
    path("admin/museum/pieces/<int:pk>", AdminMuseumPieceDetailView.as_view(), name="admin-museum-piece-detail"),
    path(
        "admin/museum/exhibitions",
        AdminMuseumExhibitionListView.as_view(),
        name="admin-museum-exhibitions",
    ),
    path(
        "admin/museum/exhibitions/<int:pk>",
        AdminMuseumExhibitionDetailView.as_view(),
        name="admin-museum-exhibition-detail",
    ),
]
