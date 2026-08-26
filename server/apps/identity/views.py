from django.contrib.auth import get_user_model
from drf_spectacular.utils import OpenApiResponse, extend_schema, inline_serializer
from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from common.events import dispatch
from common.permissions import IsAdminRole
from common.responses.envelope import error, success

from .serializers import (
    AdminUserStatusSerializer,
    ChangePasswordSerializer,
    CurrentUserSerializer,
    RegisterSerializer,
    UserSerializer,
)
from .services import revoke_refresh_tokens

User = get_user_model()


class _EnvelopeMixin:
    """Envuelve la respuesta de SimpleJWT en el contrato {"data", "meta"} (sección 63)."""

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            response.data = {"data": response.data, "meta": {}}
        return response


class LoginView(_EnvelopeMixin, TokenObtainPairView):
    # Fuerza bruta de credenciales: límite por IP (sección 48).
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


class RefreshView(_EnvelopeMixin, TokenRefreshView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "auth"


@extend_schema(
    request=inline_serializer(
        "LogoutRequest", fields={"refresh": serializers.CharField()}
    ),
    responses={205: OpenApiResponse(description="Sesión cerrada.")},
)
class LogoutView(APIView):
    def post(self, request):
        refresh = request.data.get("refresh")
        if not refresh:
            return error("BAD_REQUEST", "Falta 'refresh'.")
        try:
            RefreshToken(refresh).blacklist()
        except TokenError:
            # Token vencido, malformado o ya en la blacklist: `TokenError` no
            # es una APIException, así que sin este except el handler global
            # la deja pasar y Django responde 500 sin envelope.
            return error("BAD_REQUEST", "El refresh token no es válido o ya expiró.")
        return Response(status=status.HTTP_205_RESET_CONTENT)


@extend_schema(responses={201: UserSerializer})
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "register"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        dispatch("user.registered", user=user)
        return success(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class MeView(generics.RetrieveUpdateAPIView):
    """Sirve tanto GET /auth/me como PATCH /users/me."""

    serializer_class = CurrentUserSerializer

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success(serializer.data)


@extend_schema(
    request=ChangePasswordSerializer,
    responses={204: OpenApiResponse(description="Contraseña actualizada.")},
)
class ChangePasswordView(APIView):
    def patch(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        # Cambiar la contraseña debe expulsar cualquier sesión abierta (el caso
        # de uso es justamente "me robaron la cuenta"): sin esto el refresh
        # token del atacante seguía vivo 7 días.
        revoke_refresh_tokens(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by("-created_at")
    serializer_class = UserSerializer
    permission_classes = [IsAdminRole]


class AdminUserStatusView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    permission_classes = [IsAdminRole]
    http_method_names = ["get", "patch"]

    def get_serializer_class(self):
        return AdminUserStatusSerializer if self.request.method == "PATCH" else UserSerializer

    def retrieve(self, request, *args, **kwargs):
        return success(UserSerializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        user = self.get_object()

        if user.pk == request.user.pk:
            return error("FORBIDDEN", "No puedes cambiar el estado de tu propia cuenta.", status=403)
        if user.is_admin and request.user.role != User.Role.SUPER_ADMIN:
            return error(
                "FORBIDDEN",
                "Solo un super_admin puede cambiar el estado de otra cuenta administradora.",
                status=403,
            )

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if user.status != User.Status.ACTIVE:
            # `User.save()` ya puso is_active=False; esto además impide que el
            # usuario siga renovando su sesión con un refresh token vigente.
            revoke_refresh_tokens(user)

        dispatch("account.status_changed", user=user)
        return success(serializer.data)
