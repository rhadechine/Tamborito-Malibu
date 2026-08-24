from django.urls import path

from .views import (
    AdminUserListView,
    AdminUserStatusView,
    ChangePasswordView,
    LoginView,
    LogoutView,
    MeView,
    RefreshView,
    RegisterView,
)

urlpatterns = [
    path("auth/login", LoginView.as_view(), name="auth-login"),
    path("auth/register", RegisterView.as_view(), name="auth-register"),
    path("auth/refresh", RefreshView.as_view(), name="auth-refresh"),
    path("auth/logout", LogoutView.as_view(), name="auth-logout"),
    path("auth/me", MeView.as_view(), name="auth-me"),
    path("users/me", MeView.as_view(), name="users-me"),
    path("users/me/password", ChangePasswordView.as_view(), name="users-me-password"),
    path("admin/users", AdminUserListView.as_view(), name="admin-users"),
    path("admin/users/<int:pk>/status", AdminUserStatusView.as_view(), name="admin-user-status"),
]
