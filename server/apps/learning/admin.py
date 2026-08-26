from django.contrib import admin

from .models import Enrollment, Evidence, LessonProgress


class LessonProgressInline(admin.TabularInline):
    model = LessonProgress
    extra = 0


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "course", "status", "source", "enrolled_at"]
    list_filter = ["status", "source"]
    inlines = [LessonProgressInline]


@admin.register(Evidence)
class EvidenceAdmin(admin.ModelAdmin):
    list_display = ["id", "enrollment", "lesson", "status", "submitted_at"]
    list_filter = ["status"]
