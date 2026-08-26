from django.urls import path

from .views import (
    AdminEnrollmentDetailView,
    AdminEnrollmentListView,
    AdminEvidenceDetailView,
    AdminEvidenceListView,
    AdminEvidenceReviewView,
    AdminStudentEnrollmentListView,
    EnrollFreeView,
    LessonEvidenceView,
    LessonProgressView,
    StudentCourseDetailView,
    StudentDashboardView,
    StudentEnrollmentListView,
    StudentLessonDetailView,
)

urlpatterns = [
    path("student/dashboard", StudentDashboardView.as_view(), name="student-dashboard"),
    path("student/enrollments", StudentEnrollmentListView.as_view(), name="student-enrollments"),
    path("student/courses/<int:course_id>", StudentCourseDetailView.as_view(), name="student-course-detail"),
    path(
        "student/courses/<int:course_id>/lessons/<int:lesson_id>",
        StudentLessonDetailView.as_view(),
        name="student-lesson-detail",
    ),
    path("student/courses/<int:course_id>/enroll-free", EnrollFreeView.as_view(), name="enroll-free"),
    path(
        "student/courses/<int:course_id>/lessons/<int:lesson_id>/progress",
        LessonProgressView.as_view(),
        name="lesson-progress",
    ),
    path(
        "student/courses/<int:course_id>/lessons/<int:lesson_id>/evidence",
        LessonEvidenceView.as_view(),
        name="lesson-evidence",
    ),
    path("admin/enrollments", AdminEnrollmentListView.as_view(), name="admin-enrollments"),
    path(
        "admin/students/<int:user_id>/enrollments",
        AdminStudentEnrollmentListView.as_view(),
        name="admin-student-enrollments",
    ),
    path("admin/enrollments/<int:pk>", AdminEnrollmentDetailView.as_view(), name="admin-enrollment-detail"),
    path("admin/evidences", AdminEvidenceListView.as_view(), name="admin-evidences"),
    path("admin/evidences/<int:pk>", AdminEvidenceDetailView.as_view(), name="admin-evidence-detail"),
    path(
        "admin/evidences/<int:evidence_id>/review",
        AdminEvidenceReviewView.as_view(),
        name="admin-evidence-review",
    ),
]
