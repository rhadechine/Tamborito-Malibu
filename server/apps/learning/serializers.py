from rest_framework import serializers

from apps.courses.serializers import CourseListSerializer, LessonOutlineSerializer

from .models import Enrollment, Evidence, LessonProgress
from .services import progress_percent


class EnrollmentSerializer(serializers.ModelSerializer):
    course = CourseListSerializer(read_only=True)
    last_lesson = LessonOutlineSerializer(read_only=True)
    progress_percent = serializers.SerializerMethodField()

    class Meta:
        model = Enrollment
        fields = [
            "id", "course", "status", "source", "order", "enrolled_at", "completed_at",
            "last_lesson", "grade", "attendance", "progress_percent",
        ]

    def get_progress_percent(self, enrollment):
        return progress_percent(enrollment)


class LessonProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonProgress
        fields = ["id", "lesson", "status", "completed_at", "time_spent_seconds"]


class MarkLessonProgressSerializer(serializers.Serializer):
    time_spent_seconds = serializers.IntegerField(required=False, default=0, min_value=0)


class EvidenceCreateSerializer(serializers.Serializer):
    media_id = serializers.IntegerField()
    description = serializers.CharField(required=False, allow_blank=True, default="")


class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = [
            "id", "enrollment", "lesson", "file_media", "file_name", "file_type", "file_size",
            "description", "status", "feedback", "submitted_at", "reviewed_at",
        ]
        read_only_fields = [f for f in fields if f not in ("status", "feedback")]


class EvidenceReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = ["status", "feedback"]


class AdminEnrollmentCreateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    course_id = serializers.IntegerField()


class AdminEnrollmentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ["status", "grade", "attendance"]
