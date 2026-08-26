from django.urls import path

from .views import (
    AdminNotificationCreateView,
    NotificationListView,
    NotificationMarkAllReadView,
    NotificationMarkReadView,
)

urlpatterns = [
    path("notifications", NotificationListView.as_view(), name="notifications"),
    path("notifications/read-all", NotificationMarkAllReadView.as_view(), name="notifications-read-all"),
    path(
        "notifications/<int:notification_id>/read",
        NotificationMarkReadView.as_view(),
        name="notification-read",
    ),
    path("admin/notifications", AdminNotificationCreateView.as_view(), name="admin-notifications"),
]
