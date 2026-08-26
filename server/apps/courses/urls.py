from django.urls import path

from .views import (
    AdminCourseArchiveView,
    AdminCourseDetailView,
    AdminCourseListCreateView,
    AdminCoursePublishView,
    AdminLessonCreateView,
    AdminLessonDetailView,
    AdminModuleCreateView,
    AdminModuleDetailView,
    CourseDetailView,
    CourseListView,
    CoursePreviewView,
    InstructorDetailView,
)

urlpatterns = [
    # Público
    path("courses", CourseListView.as_view(), name="course-list"),
    path("courses/<slug:slug>", CourseDetailView.as_view(), name="course-detail"),
    path("courses/<int:course_id>/preview", CoursePreviewView.as_view(), name="course-preview"),
    path("instructors/<int:instructor_id>", InstructorDetailView.as_view(), name="instructor-detail"),
    # Admin: cursos
    path("admin/courses", AdminCourseListCreateView.as_view(), name="admin-courses"),
    path("admin/courses/<int:course_id>", AdminCourseDetailView.as_view(), name="admin-course-detail"),
    path("admin/courses/<int:course_id>/publish", AdminCoursePublishView.as_view(), name="admin-course-publish"),
    path("admin/courses/<int:course_id>/archive", AdminCourseArchiveView.as_view(), name="admin-course-archive"),
    # Admin: módulos
    path("admin/courses/<int:course_id>/modules", AdminModuleCreateView.as_view(), name="admin-course-modules"),
    path("admin/modules/<int:module_id>", AdminModuleDetailView.as_view(), name="admin-module-detail"),
    # Admin: lecciones
    path("admin/modules/<int:module_id>/lessons", AdminLessonCreateView.as_view(), name="admin-module-lessons"),
    path("admin/lessons/<int:lesson_id>", AdminLessonDetailView.as_view(), name="admin-lesson-detail"),
]
