from rest_framework import generics
from rest_framework.permissions import AllowAny

from common.events import dispatch
from common.permissions import OrganizationScopePermission

from .models import CollectionGroup, MuseumExhibition, MuseumPiece, Status
from .serializers import (
    CollectionGroupAdminSerializer,
    CollectionGroupSerializer,
    MuseumExhibitionAdminSerializer,
    MuseumExhibitionSerializer,
    MuseumPieceAdminSerializer,
    MuseumPieceDetailSerializer,
    MuseumPieceListSerializer,
)

# --- Público ---


class CollectionGroupListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = CollectionGroupSerializer
    queryset = CollectionGroup.objects.filter(status=Status.PUBLISHED)


class MuseumPieceListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MuseumPieceListSerializer

    def get_queryset(self):
        qs = MuseumPiece.objects.filter(status=Status.PUBLISHED)
        collection_group_id = self.request.query_params.get("collection_group_id")
        if collection_group_id:
            qs = qs.filter(collection_group_id=collection_group_id)
        return qs


class MuseumPieceDetailView(generics.RetrieveAPIView):
    permission_classes = [AllowAny]
    serializer_class = MuseumPieceDetailSerializer
    lookup_field = "slug"
    queryset = MuseumPiece.objects.filter(status=Status.PUBLISHED)


class MuseumExhibitionListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = MuseumExhibitionSerializer
    queryset = MuseumExhibition.objects.filter(status=Status.PUBLISHED)


# --- Admin ---
#
# El dominio Museo pertenece por definicion a la organizacion "museum"
# (sus modelos no llevan campo `organization`), asi que la comprobacion de
# alcance es fija: un admin de Fundacion no administra piezas del museo.


class _MuseumAdminPermissionMixin:
    permission_classes = [OrganizationScopePermission]
    organization = "museum"



class AdminCollectionGroupListView(_MuseumAdminPermissionMixin, generics.ListCreateAPIView):
    serializer_class = CollectionGroupAdminSerializer
    queryset = CollectionGroup.objects.all()


class AdminCollectionGroupDetailView(_MuseumAdminPermissionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CollectionGroupAdminSerializer
    queryset = CollectionGroup.objects.all()


class AdminMuseumPieceListView(_MuseumAdminPermissionMixin, generics.ListCreateAPIView):
    serializer_class = MuseumPieceAdminSerializer
    queryset = MuseumPiece.objects.all()

    def perform_create(self, serializer):
        piece = serializer.save()
        dispatch("museum.piece.created", piece=piece)


class AdminMuseumPieceDetailView(_MuseumAdminPermissionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MuseumPieceAdminSerializer
    queryset = MuseumPiece.objects.all()

    def perform_update(self, serializer):
        piece = serializer.save()
        dispatch("museum.piece.updated", piece=piece)


class AdminMuseumExhibitionListView(_MuseumAdminPermissionMixin, generics.ListCreateAPIView):
    serializer_class = MuseumExhibitionAdminSerializer
    queryset = MuseumExhibition.objects.all()


class AdminMuseumExhibitionDetailView(_MuseumAdminPermissionMixin, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MuseumExhibitionAdminSerializer
    queryset = MuseumExhibition.objects.all()
