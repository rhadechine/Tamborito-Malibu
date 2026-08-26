from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions
from rest_framework.views import APIView

from common.events import dispatch
from common.permissions import (
    OrganizationScopedQuerysetMixin,
    OrganizationScopePermission,
    assert_scope,
)
from common.responses.envelope import success
from common.schema import CourseStatusResponseSerializer

from .models import Course, CourseModule, Instructor, Lesson
from .serializers import (
    CourseAdminSerializer,
    CourseDetailSerializer,
    CourseListSerializer,
    CourseModuleSerializer,
    CoursePreviewSerializer,
    InstructorSerializer,
    LessonSerializer,
)

# --- Público ---


class CourseListView(generics.ListAPIView):
    queryset = Course.objects.filter(status=Course.Status.PUBLISHED).order_by("-created_at")
    serializer_class = CourseListSerializer
    permission_classes = [permissions.AllowAny]


class CourseDetailView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(status=Course.Status.PUBLISHED)
    serializer_class = CourseDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "slug"

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)


class CoursePreviewView(generics.RetrieveAPIView):
    queryset = Course.objects.filter(status=Course.Status.PUBLISHED)
    serializer_class = CoursePreviewSerializer
    permission_classes = [permissions.AllowAny]
    lookup_url_kwarg = "course_id"

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)


class InstructorDetailView(generics.RetrieveAPIView):
    queryset = Instructor.objects.all()
    serializer_class = InstructorSerializer
    permission_classes = [permissions.AllowAny]
    lookup_url_kwarg = "instructor_id"

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)


# --- Admin: cursos ---


class AdminCourseListCreateView(OrganizationScopedQuerysetMixin, generics.ListCreateAPIView):
    queryset = Course.objects.all().order_by("-created_at")
    serializer_class = CourseAdminSerializer
    permission_classes = [OrganizationScopePermission]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()
        dispatch("course.created", course=course)
        return success(self.get_serializer(course).data, status=201)


class AdminCourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseAdminSerializer
    permission_classes = [OrganizationScopePermission]
    lookup_url_kwarg = "course_id"

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        course = serializer.save()
        dispatch("course.updated", course=course)
        return success(self.get_serializer(course).data)


@extend_schema(request=None, responses={200: CourseStatusResponseSerializer})
class _CourseStatusView(APIView):
    permission_classes = [OrganizationScopePermission]
    target_status: str
    event_name: str

    def post(self, request, course_id):
        course = generics.get_object_or_404(Course, pk=course_id)
        assert_scope(request.user, course.organization)
        course.status = self.target_status
        course.save(update_fields=["status"])
        dispatch(self.event_name, course=course)
        return success({"id": course.id, "status": course.status})


class AdminCoursePublishView(_CourseStatusView):
    target_status = Course.Status.PUBLISHED
    event_name = "course.published"


class AdminCourseArchiveView(_CourseStatusView):
    target_status = Course.Status.ARCHIVED
    event_name = "course.archived"


# --- Admin: módulos ---


class AdminModuleCreateView(generics.CreateAPIView):
    serializer_class = CourseModuleSerializer
    permission_classes = [OrganizationScopePermission]

    def create(self, request, *args, **kwargs):
        # Un módulo hereda la organización de su curso. Además, sin resolver el
        # curso aquí, un course_id inexistente reventaba con IntegrityError 500.
        course = generics.get_object_or_404(Course, pk=self.kwargs["course_id"])
        assert_scope(request.user, course.organization)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        module = serializer.save(course=course)
        return success(self.get_serializer(module).data, status=201)


class AdminModuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourseModule.objects.all()
    serializer_class = CourseModuleSerializer
    permission_classes = [OrganizationScopePermission]
    organization_source = "course.organization"
    lookup_url_kwarg = "module_id"
    http_method_names = ["get", "patch", "delete"]

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        module = serializer.save()
        return success(self.get_serializer(module).data)


# --- Admin: lecciones ---


class AdminLessonCreateView(generics.CreateAPIView):
    serializer_class = LessonSerializer
    permission_classes = [OrganizationScopePermission]

    def create(self, request, *args, **kwargs):
        module = generics.get_object_or_404(
            CourseModule.objects.select_related("course"), pk=self.kwargs["module_id"]
        )
        assert_scope(request.user, module.course.organization)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save(module=module)
        return success(self.get_serializer(lesson).data, status=201)


class AdminLessonDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [OrganizationScopePermission]
    organization_source = "module.course.organization"
    lookup_url_kwarg = "lesson_id"
    http_method_names = ["get", "patch", "delete"]

    def retrieve(self, request, *args, **kwargs):
        return success(self.get_serializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        lesson = serializer.save()
        return success(self.get_serializer(lesson).data)
