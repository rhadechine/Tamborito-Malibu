from drf_spectacular.utils import extend_schema
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from common.permissions import IsSuperAdmin
from common.responses.envelope import success

from .models import Donation
from .serializers import (
    DonationAdminUpdateSerializer,
    DonationCreateSerializer,
    DonationSerializer,
)


@extend_schema(request=DonationCreateSerializer, responses={201: DonationSerializer})
class DonationCreateView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "donation"

    def post(self, request):
        serializer = DonationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = request.user if request.user.is_authenticated else None
        donation = serializer.save(donor_user=user)
        return success(DonationSerializer(donation).data, status=201)


class StudentDonationListView(generics.ListAPIView):
    serializer_class = DonationSerializer

    def get_queryset(self):
        return Donation.objects.filter(donor_user=self.request.user).order_by("-created_at")


class AdminDonationListView(generics.ListAPIView):
    queryset = Donation.objects.all().order_by("-created_at")
    serializer_class = DonationSerializer
    permission_classes = [IsSuperAdmin]


class AdminDonationDetailView(generics.RetrieveUpdateAPIView):
    queryset = Donation.objects.all()
    permission_classes = [IsSuperAdmin]
    http_method_names = ["get", "patch"]

    def get_serializer_class(self):
        return DonationAdminUpdateSerializer if self.request.method == "PATCH" else DonationSerializer

    def retrieve(self, request, *args, **kwargs):
        return success(DonationSerializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        donation = self.get_object()
        serializer = self.get_serializer(donation, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success(DonationSerializer(donation).data)
