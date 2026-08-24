"""Split 06 — Learning: puerta de entrada para otros dominios (sección 17).

Commerce/Payments no deben escribir directamente sobre las tablas de
Learning (sección 4 — propiedad de datos); llaman a estas funciones en su
lugar.
"""

from django.db.models import Count
from django.utils import timezone

from apps.courses.models import Lesson
from apps.library import services as library_services
from common.events import dispatch

from .models import Enrollment, LessonProgress


def enroll_free(user, course):
    if not course.is_free:
        raise ValueError("El curso no es gratuito.")
    enrollment, created = Enrollment.objects.get_or_create(
        user=user, course=course, defaults={"source": Enrollment.Source.FREE}
    )
    library_services.grant_course_access(user, course)
    if created:
        dispatch("enrollment.created", enrollment=enrollment)
    return enrollment


def enroll_admin(user, course):
    enrollment, created = Enrollment.objects.get_or_create(
        user=user, course=course, defaults={"source": Enrollment.Source.ADMIN}
    )
    library_services.grant_course_access(user, course)
    if created:
        dispatch("enrollment.created", enrollment=enrollment)
    return enrollment


def enroll_from_order(order):
    """payment.approved -> Enrollment por cada curso de la orden (sección 17)."""
    enrollments = []
    for item in order.items.select_related("course").filter(course__isnull=False):
        enrollment, created = Enrollment.objects.get_or_create(
            user=order.user,
            course=item.course,
            defaults={"source": Enrollment.Source.ORDER, "order": order},
        )
        library_services.grant_course_access(order.user, item.course, via_purchase=True)
        if created:
            dispatch("enrollment.created", enrollment=enrollment)
        enrollments.append(enrollment)
    return enrollments


def revoke_from_order(order):
    """payment.refunded -> se retira el acceso que dio esa orden (sección 19).

    Solo se cancelan las inscripciones cuyo origen es esta compra
    (`source=order`). Si el usuario ya tenía el curso por otra vía —gratuito o
    alta manual del admin— se conserva la inscripción y únicamente se degrada
    el grant de Library para que deje de contar como compra.
    """
    revoked = []
    for item in order.items.select_related("course").filter(course__isnull=False):
        enrollment = Enrollment.objects.filter(user=order.user, course=item.course).first()

        if enrollment is None:
            library_services.revoke_course_access(order.user, item.course, purchase_only=True)
            continue

        if enrollment.source != Enrollment.Source.ORDER:
            library_services.revoke_course_access(order.user, item.course, purchase_only=True)
            continue

        if enrollment.status != Enrollment.Status.CANCELLED:
            enrollment.status = Enrollment.Status.CANCELLED
            enrollment.save(update_fields=["status"])
        library_services.revoke_course_access(order.user, item.course)
        dispatch("enrollment.revoked", enrollment=enrollment)
        revoked.append(enrollment)
    return revoked


def has_active_enrollment(user, course):
    """Usada por Commerce (nivel 4, superior a Learning) para impedir volver
    a vender un curso que el usuario ya tiene activo o completado."""
    return Enrollment.objects.filter(user=user, course=course).exclude(
        status=Enrollment.Status.CANCELLED
    ).exists()


def progress_percent(enrollment):
    # `annotate_progress` (más abajo) precalcula estos dos números para listas
    # completas en dos queries fijas; si ya están, se usan tal cual en vez de
    # repetir el cálculo por inscripción.
    if hasattr(enrollment, "_total_lessons"):
        total = enrollment._total_lessons
        completed = enrollment._completed_lessons
    else:
        total = Lesson.objects.filter(module__course=enrollment.course).count()
        completed = enrollment.lesson_progress.filter(status=LessonProgress.Status.COMPLETED).count()

    if total == 0:
        return 0
    return round(completed * 100 / total)


def annotate_progress(enrollments):
    """Precalcula el progreso de una página de inscripciones en 2 queries.

    `EnrollmentSerializer.get_progress_percent` llamaba a `progress_percent`
    por cada fila (sección 26 de la revisión: 2 queries × N inscripciones en
    el dashboard del estudiante y en los listados admin). Aquí se resuelve
    con una consulta de conteo de lecciones por curso y otra de progreso
    completado por inscripción, sin importar cuántas filas traiga la página.

    Recibe y devuelve una lista materializada (no un queryset): hace falta
    conocer de antemano los `course_id`/`id` involucrados para construir las
    dos consultas, así que quien llama debe paginar primero y anotar después
    — anotar antes de paginar forzaría a traer la tabla completa a Python
    para descartar casi todo.
    """
    enrollments = list(enrollments)
    if not enrollments:
        return enrollments

    course_ids = {enrollment.course_id for enrollment in enrollments}
    lessons_per_course = dict(
        Lesson.objects.filter(module__course_id__in=course_ids)
        .values_list("module__course_id")
        .annotate(total=Count("id"))
        .values_list("module__course_id", "total")
    )

    enrollment_ids = [enrollment.id for enrollment in enrollments]
    completed_per_enrollment = dict(
        LessonProgress.objects.filter(
            enrollment_id__in=enrollment_ids, status=LessonProgress.Status.COMPLETED
        )
        .values_list("enrollment_id")
        .annotate(completed=Count("id"))
        .values_list("enrollment_id", "completed")
    )

    for enrollment in enrollments:
        enrollment._total_lessons = lessons_per_course.get(enrollment.course_id, 0)
        enrollment._completed_lessons = completed_per_enrollment.get(enrollment.id, 0)

    return enrollments


def mark_lesson_complete(enrollment, lesson, time_spent_seconds=0):
    progress, _created = LessonProgress.objects.update_or_create(
        enrollment=enrollment,
        lesson=lesson,
        defaults={
            "status": LessonProgress.Status.COMPLETED,
            "completed_at": timezone.now(),
            "time_spent_seconds": time_spent_seconds,
        },
    )
    enrollment.last_lesson = lesson
    just_completed = progress_percent(enrollment) >= 100 and enrollment.status != Enrollment.Status.COMPLETED
    if just_completed:
        enrollment.status = Enrollment.Status.COMPLETED
        enrollment.completed_at = timezone.now()
    enrollment.save(update_fields=["last_lesson", "status", "completed_at"])
    if just_completed:
        # sección 30: course.completed -> Certificates (si certificate_enabled),
        # Notifications, Reports.
        dispatch("course.completed", enrollment=enrollment)
    return progress


def clear_lesson_progress(enrollment, lesson):
    LessonProgress.objects.filter(enrollment=enrollment, lesson=lesson).delete()
    if enrollment.status == Enrollment.Status.COMPLETED:
        enrollment.status = Enrollment.Status.ACTIVE
        enrollment.completed_at = None
        enrollment.save(update_fields=["status", "completed_at"])
