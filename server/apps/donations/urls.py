from django.urls import path

from .views import (
    AdminDonationDetailView,
    AdminDonationListView,
    DonationCreateView,
    StudentDonationListView,
)

urlpatterns = [
    path("donations", DonationCreateView.as_view(), name="donations"),
    path("student/donations", StudentDonationListView.as_view(), name="student-donations"),
    path("admin/donations", AdminDonationListView.as_view(), name="admin-donations"),
    path("admin/donations/<int:pk>", AdminDonationDetailView.as_view(), name="admin-donation-detail"),
]
