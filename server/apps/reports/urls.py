from django.urls import path

from .views import (
    ReportCourseRevenueView,
    ReportDonationsView,
    ReportEnrollmentsView,
    ReportSummaryView,
    ReportTransactionsView,
)

urlpatterns = [
    path("admin/reports/summary", ReportSummaryView.as_view(), name="report-summary"),
    path("admin/reports/transactions", ReportTransactionsView.as_view(), name="report-transactions"),
    path("admin/reports/course-revenue", ReportCourseRevenueView.as_view(), name="report-course-revenue"),
    path("admin/reports/enrollments", ReportEnrollmentsView.as_view(), name="report-enrollments"),
    path("admin/reports/donations", ReportDonationsView.as_view(), name="report-donations"),
]
