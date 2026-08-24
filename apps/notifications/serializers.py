from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "type", "read", "created_at"]


class AdminNotificationCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    title = serializers.CharField(max_length=200)
    message = serializers.CharField(required=False, allow_blank=True, default="")
    type = serializers.ChoiceField(choices=Notification.Type.choices, default=Notification.Type.GENERAL)
