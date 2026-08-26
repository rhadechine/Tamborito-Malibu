from django.shortcuts import get_object_or_404
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.views import APIView

from apps.identity.models import User
from common.permissions import IsAdminRole
from common.responses.envelope import success

from . import services
from .models import Notification
from .serializers import AdminNotificationCreateSerializer, NotificationSerializer


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


@extend_schema(request=None, responses={200: NotificationSerializer})
class NotificationMarkReadView(APIView):
    def patch(self, request, notification_id):
        notification = get_object_or_404(Notification, pk=notification_id, user=request.user)
        notification.read = True
        notification.save(update_fields=["read"])
        return success(NotificationSerializer(notification).data)


@extend_schema(request=None, responses={200: OpenApiTypes.OBJECT})
class NotificationMarkAllReadView(APIView):
    def patch(self, request):
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return success({})


@extend_schema(request=AdminNotificationCreateSerializer, responses={201: NotificationSerializer})
class AdminNotificationCreateView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        serializer = AdminNotificationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_object_or_404(User, pk=serializer.validated_data["user_id"])
        notification = services.notify(
            user,
            serializer.validated_data["title"],
            serializer.validated_data["message"],
            type=serializer.validated_data["type"],
        )
        return success(NotificationSerializer(notification).data, status=201)
