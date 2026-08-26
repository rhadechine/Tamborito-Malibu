from django.urls import path

from .views import AdminSettingsView, PublicSettingsView

urlpatterns = [
    path("settings", PublicSettingsView.as_view(), name="public-settings"),
    path("admin/settings", AdminSettingsView.as_view(), name="admin-settings"),
]
