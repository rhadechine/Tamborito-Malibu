from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.courses.models import Course, Lesson
from apps.courses.serializers import CourseDetailSerializer, LessonPreviewSerializer
from apps.identity.models import User
from apps.media.models import MediaAsset
from common.events import dispatch
from common.permissions import OrganizationScopePermission, assert_scope
from common.responses.envelope import error, success
from common.scopes import allowed_organizations

from . import services
from .models import Enrollment, Evidence
from .serializers import (
    AdminEnrollmentCreateSerializer,
    AdminEnrollmentUpdateSerializer,
    EnrollmentSerializer,
    EvidenceCreateSerializer,
    EvidenceReviewSerializer,
    EvidenceSerializer,
    MarkLessonProgressSerializer,
)


def _enrollment_with_access(user, course_id):
    """Inscripción que habilita el contenido del curso.

    Una inscripción `cancelled` (p. ej. tras un reembolso) ya no da acceso;
    una `completed` sí, porque el estudiante debe poder repasar el material.
    """
    return get_object_or_404(
        Enrollment.objects.exclude(status=Enrollment.Status.CANCELLED),
        user=user,
        course_id=course_id,
    )


class _AnnotatesProgressMixin:
    """Precalcula `progress_percent` para la página ya paginada.

    `paginate_queryset` es el punto exacto donde DRF ya resolvió qué filas
    van en esta página (una lista corta, típicamente `page_size`) y todavía
    no llamó al serializer. Anotar aquí evita las 2×N queries de
    `EnrollmentSerializer.get_progress_percent` sin tener que traer a Python
    la tabla completa antes de paginar (sección 26 de la revisión).
    """

    def paginate_queryset(self, queryset):
        page = super().paginate_queryset(queryset)
        if page is not None:
            services.annotate_progress(page)
        return page


# --- Estudiante ---


class StudentDashboardView(_AnnotatesProgressMixin, generics.ListAPIView):
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(
            user=self.request.user, status=Enrollment.Status.ACTIVE
        ).select_related("course", "last_lesson").order_by("-enrolled_at")


class StudentEnrollmentListView(_AnnotatesProgressMixin, generics.ListAPIView):
    serializer_class = EnrollmentSerializer

    def get_queryset(self):
        return Enrollment.objects.filter(user=self.request.user).select_related(
            "course", "last_lesson"
        ).order_by("-enrolled_at")


@extend_schema(
    responses={200: OpenApiTypes.OBJECT},
    description=(
        "Detalle del curso para un estudiante inscrito: los campos de "
        "CourseDetail más una clave `enrollment` con su inscripción."
    ),
)
class StudentCourseDetailView(APIView):
    def get(self, request, course_id):
        enrollment = _enrollment_with_access(request.user, course_id)
        data = CourseDetailSerializer(enrollment.course).data
        data["enrollment"] = EnrollmentSerializer(enrollment).data
        return success(data)


@extend_schema(responses={200: LessonPreviewSerializer})
class StudentLessonDetailView(APIView):
    def get(self, request, course_id, lesson_id):
        lesson = get_object_or_404(Lesson, pk=lesson_id, module__course_id=course_id)
        if not lesson.preview:
            _enrollment_with_access(request.user, course_id)
        return success(LessonPreviewSerializer(lesson).data)


@extend_schema(request=None, responses={201: EnrollmentSerializer})
class EnrollFreeView(APIView):
    def post(self, request, course_id):
        # Solo cursos publicados: sin este filtro un estudiante podía
        # inscribirse en un borrador o en un curso archivado conociendo su id.
        course = get_object_or_404(Course, pk=course_id, status=Course.Status.PUBLISHED)
        if not course.is_free:
            return error("BAD_REQUEST", "El curso no es gratuito.")
        enrollment = services.enroll_free(request.user, course)
        return success(EnrollmentSerializer(enrollment).data, status=201)


@extend_schema(
    request=MarkLessonProgressSerializer,
    responses={
        200: EnrollmentSerializer,
        204: OpenApiResponse(description="Progreso de la lección eliminado."),
    },
)
class LessonProgressView(APIView):
    def post(self, request, course_id, lesson_id):
        enrollment = _enrollment_with_access(request.user, course_id)
        lesson = get_object_or_404(Lesson, pk=lesson_id, module__course_id=course_id)
        serializer = MarkLessonProgressSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        services.mark_lesson_complete(enrollment, lesson, **serializer.validated_data)
        enrollment.refresh_from_db()
        return success(EnrollmentSerializer(enrollment).data)

    def delete(self, request, course_id, lesson_id):
        enrollment = _enrollment_with_access(request.user, course_id)
        lesson = get_object_or_404(Lesson, pk=lesson_id, module__course_id=course_id)
        services.clear_lesson_progress(enrollment, lesson)
        return Response(status=204)


@extend_schema(request=EvidenceCreateSerializer, responses={201: EvidenceSerializer})
class LessonEvidenceView(APIView):
    def post(self, request, course_id, lesson_id):
        enrollment = _enrollment_with_access(request.user, course_id)
        lesson = get_object_or_404(Lesson, pk=lesson_id, module__course_id=course_id)
        if not lesson.upload_enabled:
            return error("BAD_REQUEST", "Esta lección no admite evidencias.")

        serializer = EvidenceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        # Solo se puede adjuntar un archivo propio: sin el filtro por
        # `owner_user` cualquier estudiante podía referenciar el MediaAsset de
        # otro y leer su nombre, tipo y tamaño en la respuesta.
        media = get_object_or_404(
            MediaAsset, pk=serializer.validated_data["media_id"], owner_user=request.user
        )

        evidence = Evidence.objects.create(
            enrollment=enrollment,
            lesson=lesson,
            file_media=media,
            file_name=media.original_name,
            file_type=media.mime_type,
            file_size=media.size,
            description=serializer.validated_data["description"],
        )
        dispatch("evidence.submitted", evidence=evidence)
        return success(EvidenceSerializer(evidence).data, status=201)


# --- Admin ---


class AdminEnrollmentListView(_AnnotatesProgressMixin, generics.ListAPIView):
    """Una inscripcion pertenece a la organizacion de su curso (seccion 39)."""

    serializer_class = EnrollmentSerializer
    permission_classes = [OrganizationScopePermission]

    def get_queryset(self):
        qs = (
            Enrollment.objects.filter(
                course__organization__in=allowed_organizations(self.request.user)
            )
            .select_related("course", "user")
            .order_by("-enrolled_at")
        )
        course_id = self.request.query_params.get("course_id")
        if course_id:
            qs = qs.filter(course_id=course_id)
        return qs

    def post(self, request):
        serializer = AdminEnrollmentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = get_object_or_404(User, pk=serializer.validated_data["user_id"])
        course = get_object_or_404(Course, pk=serializer.validated_data["course_id"])
        assert_scope(request.user, course.organization)
        enrollment = services.enroll_admin(user, course)
        return success(EnrollmentSerializer(enrollment).data, status=201)


class AdminStudentEnrollmentListView(_AnnotatesProgressMixin, generics.ListAPIView):
    serializer_class = EnrollmentSerializer
    permission_classes = [OrganizationScopePermission]

    def get_queryset(self):
        return Enrollment.objects.filter(
            user_id=self.kwargs["user_id"],
            course__organization__in=allowed_organizations(self.request.user),
        ).select_related("course").order_by("-enrolled_at")


class AdminEnrollmentDetailView(generics.RetrieveUpdateAPIView):
    queryset = Enrollment.objects.all().select_related("course", "user")
    permission_classes = [OrganizationScopePermission]
    organization_source = "course.organization"
    http_method_names = ["get", "patch"]

    def get_serializer_class(self):
        return AdminEnrollmentUpdateSerializer if self.request.method == "PATCH" else EnrollmentSerializer

    def retrieve(self, request, *args, **kwargs):
        return success(EnrollmentSerializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        enrollment = self.get_object()
        serializer = self.get_serializer(enrollment, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success(EnrollmentSerializer(enrollment).data)


class AdminEvidenceListView(generics.ListAPIView):
    serializer_class = EvidenceSerializer
    permission_classes = [OrganizationScopePermission]

    def get_queryset(self):
        qs = (
            Evidence.objects.filter(
                enrollment__course__organization__in=allowed_organizations(self.request.user)
            )
            .select_related("enrollment", "lesson")
            .order_by("-submitted_at")
        )
        status_filter = self.request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class AdminEvidenceDetailView(generics.RetrieveAPIView):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    permission_classes = [OrganizationScopePermission]
    organization_source = "enrollment.course.organization"


@extend_schema(request=EvidenceReviewSerializer, responses={200: EvidenceSerializer})
class AdminEvidenceReviewView(APIView):
    permission_classes = [OrganizationScopePermission]

    def patch(self, request, evidence_id):
        evidence = get_object_or_404(
            Evidence.objects.select_related("enrollment__course", "enrollment__user"), pk=evidence_id
        )
        assert_scope(request.user, evidence.enrollment.course.organization)
        serializer = EvidenceReviewSerializer(evidence, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(reviewed_at=timezone.now())
        # El estudiante nunca se enteraba de que su evidencia había sido
        # aprobada o rechazada — solo se auditaba/notificaba el envío
        # (`evidence.submitted`), nunca la resolución. Solo se dispara cuando
        # este PATCH trae `status`: un ajuste posterior de solo `feedback`
        # no debe volver a notificar una resolución que ya se avisó.
        if "status" in request.data:
            dispatch("evidence.reviewed", evidence=evidence)
        return success(EvidenceSerializer(evidence).data)
