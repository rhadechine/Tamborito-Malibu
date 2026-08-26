from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from common.permissions import OrganizationScopedSerializerMixin

from .models import Course, CourseModule, CourseResource, Instructor, Lesson


class InstructorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ["id", "name", "title", "avatar_media", "bio"]


class CourseListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id", "slug", "title", "subtitle", "category", "language",
            "duration_hours", "price", "is_free", "featured", "cover_media",
            "instructor", "organization",
        ]


# --- Detalle público: metadata de módulos/lecciones, sin contenido pagado ---

class LessonOutlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ["id", "title", "type", "minutes", "preview", "position"]


class ModuleOutlineSerializer(serializers.ModelSerializer):
    lessons = LessonOutlineSerializer(many=True, read_only=True)

    class Meta:
        model = CourseModule
        fields = ["id", "title", "description", "position", "lessons"]


class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleOutlineSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = [
            "id", "slug", "title", "subtitle", "description", "category", "language",
            "duration_hours", "price", "is_free", "certificate_enabled", "cover_media",
            "instructor", "organization", "modules",
        ]


# --- Preview: solo lecciones marcadas preview=True, con contenido completo ---

class LessonResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseResource
        fields = ["id", "name", "type", "media", "url", "size_label"]


class LessonPreviewSerializer(serializers.ModelSerializer):
    resources = LessonResourceSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = [
            "id", "title", "type", "minutes", "summary", "content",
            "video_media", "reading_resource", "resources",
        ]


class CoursePreviewSerializer(serializers.ModelSerializer):
    preview_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ["id", "slug", "title", "preview_lessons"]

    @extend_schema_field(LessonPreviewSerializer(many=True))
    def get_preview_lessons(self, course):
        lessons = Lesson.objects.filter(module__course=course, preview=True).order_by(
            "module__position", "position"
        )
        return LessonPreviewSerializer(lessons, many=True).data


# --- Admin ---

class CourseAdminSerializer(OrganizationScopedSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = [
            "id", "slug", "title", "subtitle", "description", "category", "language",
            "duration_hours", "price", "is_free", "status", "featured", "certificate_enabled",
            "cover_media", "instructor", "organization", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at"]


class CourseModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseModule
        fields = ["id", "course", "title", "description", "position"]
        read_only_fields = ["id", "course"]


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id", "module", "title", "type", "minutes", "preview", "summary", "content",
            "video_media", "reading_resource", "quiz_schema", "assignment_instructions",
            "upload_enabled", "position",
        ]
        read_only_fields = ["id", "module"]
