import pytest
from django.db import connection
from django.test.utils import CaptureQueriesContext
from rest_framework.test import APIClient

from apps.commerce.models import Order, OrderItem
from apps.courses.models import Course, CourseModule, Lesson
from apps.identity.models import User
from apps.learning import services
from apps.learning.models import Enrollment, Evidence, LessonProgress


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.fixture
def free_course():
    return Course.objects.create(
        slug="free", title="Free", organization="museum", price="0.00",
        status=Course.Status.PUBLISHED,
    )


@pytest.fixture
def paid_course_with_lessons():
    course = Course.objects.create(
        slug="paid", title="Paid", organization="museum", price="100.00",
        status=Course.Status.PUBLISHED,
    )
    module = CourseModule.objects.create(course=course, title="M1")
    lesson_1 = Lesson.objects.create(module=module, title="L1", type="reading")
    lesson_2 = Lesson.objects.create(module=module, title="L2", type="reading")
    return course, [lesson_1, lesson_2]


@pytest.mark.django_db
def test_enroll_free_creates_an_active_enrollment(student, free_course):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post(f"/api/v1/student/courses/{free_course.id}/enroll-free")

    assert resp.status_code == 201
    assert Enrollment.objects.get(user=student, course=free_course).source == Enrollment.Source.FREE


@pytest.mark.django_db
def test_enroll_free_rejects_a_paid_course(student, paid_course_with_lessons):
    course, _ = paid_course_with_lessons
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post(f"/api/v1/student/courses/{course.id}/enroll-free")

    assert resp.status_code == 400
    assert not Enrollment.objects.filter(user=student, course=course).exists()


@pytest.mark.django_db
def test_payment_approved_enrolls_the_student_in_every_course_of_the_order(student, paid_course_with_lessons):
    course, _ = paid_course_with_lessons
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="100.00")

    services.enroll_from_order(order)

    enrollment = Enrollment.objects.get(user=student, course=course)
    assert enrollment.source == Enrollment.Source.ORDER
    assert enrollment.order == order


@pytest.mark.django_db
def test_completing_every_lesson_marks_the_enrollment_completed(student, paid_course_with_lessons):
    course, (lesson_1, lesson_2) = paid_course_with_lessons
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.ADMIN)
    client = APIClient()
    client.force_authenticate(student)

    resp1 = client.post(f"/api/v1/student/courses/{course.id}/lessons/{lesson_1.id}/progress")
    assert resp1.data["data"]["progress_percent"] == 50

    resp2 = client.post(f"/api/v1/student/courses/{course.id}/lessons/{lesson_2.id}/progress")
    assert resp2.data["data"]["progress_percent"] == 100
    assert resp2.data["data"]["status"] == Enrollment.Status.COMPLETED

    enrollment.refresh_from_db()
    assert enrollment.completed_at is not None


@pytest.mark.django_db
def test_clearing_progress_reopens_a_completed_enrollment(student, paid_course_with_lessons):
    course, (lesson_1, lesson_2) = paid_course_with_lessons
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.ADMIN)
    services.mark_lesson_complete(enrollment, lesson_1)
    services.mark_lesson_complete(enrollment, lesson_2)
    enrollment.refresh_from_db()
    assert enrollment.status == Enrollment.Status.COMPLETED
    client = APIClient()
    client.force_authenticate(student)

    resp = client.delete(f"/api/v1/student/courses/{course.id}/lessons/{lesson_2.id}/progress")

    assert resp.status_code == 204
    enrollment.refresh_from_db()
    assert enrollment.status == Enrollment.Status.ACTIVE
    assert not LessonProgress.objects.filter(enrollment=enrollment, lesson=lesson_2).exists()


@pytest.mark.django_db
def test_student_cannot_see_another_students_enrollment(student, paid_course_with_lessons):
    course, _ = paid_course_with_lessons
    other = User.objects.create_user(email="o@o.com", password="Testpass123", name="O")
    Enrollment.objects.create(user=other, course=course, source=Enrollment.Source.ADMIN)
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/student/courses/{course.id}")

    assert resp.status_code == 404


@pytest.mark.django_db
def test_admin_can_manually_enroll_a_student(student, free_course):
    admin = User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.ADMIN_MUSEUM
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(
        "/api/v1/admin/enrollments", {"user_id": student.id, "course_id": free_course.id}
    )

    assert resp.status_code == 201
    assert Enrollment.objects.get(user=student, course=free_course).source == Enrollment.Source.ADMIN


@pytest.mark.django_db
def test_admin_can_retrieve_a_single_enrollment(student, paid_course_with_lessons):
    course, _ = paid_course_with_lessons
    admin = User.objects.create_user(
        email="a2@a.com", password="Testpass123", name="A2", role=User.Role.ADMIN_MUSEUM
    )
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.ADMIN)
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get(f"/api/v1/admin/enrollments/{enrollment.id}")

    assert resp.status_code == 200
    assert resp.data["data"]["course"]["slug"] == course.slug


@pytest.mark.django_db
def test_student_cannot_access_admin_enrollments(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get("/api/v1/admin/enrollments")

    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Acceso al contenido: una inscripción cancelada (p. ej. tras un reembolso)
# deja de abrir el curso; una completada sí sigue abriéndolo, porque el
# estudiante debe poder repasar el material.
# ---------------------------------------------------------------------------


@pytest.fixture
def enrolled_student():
    user = User.objects.create_user(email="acceso@test.com", password="Testpass123", name="Acceso")
    course = Course.objects.create(slug="c-acceso", title="C Acceso", organization="museum", is_free=True)
    module = CourseModule.objects.create(course=course, title="M1")
    lesson = Lesson.objects.create(module=module, title="L1", type=Lesson.Type.READING)
    enrollment = services.enroll_free(user, course)
    return user, course, lesson, enrollment


@pytest.mark.django_db
def test_cancelled_enrollment_loses_access_to_course_and_lessons(enrolled_student):
    user, course, lesson, enrollment = enrolled_student
    client = APIClient()
    client.force_authenticate(user)
    assert client.get(f"/api/v1/student/courses/{course.id}").status_code == 200
    assert client.get(f"/api/v1/student/courses/{course.id}/lessons/{lesson.id}").status_code == 200

    enrollment.status = Enrollment.Status.CANCELLED
    enrollment.save(update_fields=["status"])

    assert client.get(f"/api/v1/student/courses/{course.id}").status_code == 404
    assert client.get(f"/api/v1/student/courses/{course.id}/lessons/{lesson.id}").status_code == 404
    assert (
        client.post(f"/api/v1/student/courses/{course.id}/lessons/{lesson.id}/progress").status_code == 404
    )


@pytest.mark.django_db
def test_completed_enrollment_keeps_access(enrolled_student):
    user, course, lesson, enrollment = enrolled_student
    enrollment.status = Enrollment.Status.COMPLETED
    enrollment.save(update_fields=["status"])
    client = APIClient()
    client.force_authenticate(user)

    assert client.get(f"/api/v1/student/courses/{course.id}").status_code == 200
    assert client.get(f"/api/v1/student/courses/{course.id}/lessons/{lesson.id}").status_code == 200


# ---------------------------------------------------------------------------
# IDOR de evidencias: solo se puede adjuntar un MediaAsset propio.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_cannot_attach_someone_elses_media_as_evidence(enrolled_student, tmp_path, settings):
    from django.core.files.uploadedfile import SimpleUploadedFile

    from apps.media.models import MediaAsset

    settings.MEDIA_ROOT = tmp_path
    user, course, lesson, _enrollment = enrolled_student
    lesson.upload_enabled = True
    lesson.save(update_fields=["upload_enabled"])

    otro = User.objects.create_user(email="otro@test.com", password="Testpass123", name="Otro")
    ajeno = MediaAsset.objects.create(
        owner_user=otro, organization="museum", file_name="x.txt", original_name="confidencial.txt",
        storage_path="x.txt", mime_type="text/plain", file=SimpleUploadedFile("x.txt", b"x"),
    )

    client = APIClient()
    client.force_authenticate(user)
    resp = client.post(
        f"/api/v1/student/courses/{course.id}/lessons/{lesson.id}/evidence",
        {"media_id": ajeno.id, "description": "intento"},
    )

    assert resp.status_code == 404
    assert Evidence.objects.count() == 0


@pytest.mark.django_db
def test_can_attach_own_media_as_evidence(enrolled_student, tmp_path, settings):
    from django.core.files.uploadedfile import SimpleUploadedFile

    from apps.media.models import MediaAsset

    settings.MEDIA_ROOT = tmp_path
    user, course, lesson, _enrollment = enrolled_student
    lesson.upload_enabled = True
    lesson.save(update_fields=["upload_enabled"])

    propio = MediaAsset.objects.create(
        owner_user=user, organization="museum", file_name="y.txt", original_name="tarea.txt",
        storage_path="y.txt", mime_type="text/plain", file=SimpleUploadedFile("y.txt", b"y"),
    )

    client = APIClient()
    client.force_authenticate(user)
    resp = client.post(
        f"/api/v1/student/courses/{course.id}/lessons/{lesson.id}/evidence",
        {"media_id": propio.id, "description": "mi tarea"},
    )

    assert resp.status_code == 201
    assert Evidence.objects.get().file_name == "tarea.txt"


# ---------------------------------------------------------------------------
# Inscripción gratuita (sección 17): solo cursos publicados y realmente
# gratuitos. `is_free` se deriva de `price`, así que ya no pueden contradecirse.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_is_free_is_derived_from_price():
    course = Course.objects.create(slug="derivado", title="D", organization="museum", price="0.00")
    assert Course.objects.get(pk=course.pk).is_free is True

    course.price = "150.00"
    course.save(update_fields=["price"])
    assert Course.objects.get(pk=course.pk).is_free is False

    course.price = "0.00"
    course.save(update_fields=["price"])
    assert Course.objects.get(pk=course.pk).is_free is True


@pytest.mark.django_db
def test_is_free_cannot_be_forced_on_a_paid_course(student):
    # Antes bastaba con marcar is_free=True para regalar un curso de pago.
    course = Course.objects.create(
        slug="trampa", title="Trampa", organization="museum", price="200000.00",
        is_free=True, status=Course.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post(f"/api/v1/student/courses/{course.id}/enroll-free")

    assert resp.status_code == 400
    assert not Enrollment.objects.filter(user=student, course=course).exists()


@pytest.mark.django_db
@pytest.mark.parametrize("status", ["draft", "archived"])
def test_enroll_free_rejects_a_course_that_is_not_published(student, status):
    course = Course.objects.create(
        slug=f"no-publicado-{status}", title="NP", organization="museum", price="0.00", status=status
    )
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post(f"/api/v1/student/courses/{course.id}/enroll-free")

    assert resp.status_code == 404
    assert not Enrollment.objects.filter(user=student, course=course).exists()


@pytest.mark.django_db
def test_a_negative_course_price_is_rejected_by_the_admin_api():
    from apps.identity.models import User as U

    admin = U.objects.create_user(
        email="precio@a.com", password="Testpass123", name="A", role=U.Role.SUPER_ADMIN
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(
        "/api/v1/admin/courses",
        {"slug": "negativo", "title": "N", "organization": "museum", "price": "-100.00"},
    )

    assert resp.status_code == 400
    assert not Course.objects.filter(slug="negativo").exists()


# ---------------------------------------------------------------------------
# #26: el progreso de una lista de inscripciones se calcula en un número fijo
# de queries, no 2 por inscripción.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_progress_annotation_matches_the_per_instance_calculation(student):
    course = Course.objects.create(slug="prog-1", title="P1", organization="museum", is_free=True)
    module = CourseModule.objects.create(course=course, title="M1")
    lesson_a = Lesson.objects.create(module=module, title="LA", type="reading")
    Lesson.objects.create(module=module, title="LB", type="reading")
    enrollment = services.enroll_free(student, course)
    services.mark_lesson_complete(enrollment, lesson_a)
    enrollment.refresh_from_db()

    without_annotation = services.progress_percent(enrollment)

    services.annotate_progress([enrollment])
    with_annotation = services.progress_percent(enrollment)

    assert without_annotation == with_annotation == 50


@pytest.mark.django_db
def test_student_dashboard_uses_a_bounded_number_of_queries_regardless_of_enrollment_count(student):
    for i in range(8):
        course = Course.objects.create(
            slug=f"dash-{i}", title=f"D{i}", organization="museum", is_free=True,
        )
        module = CourseModule.objects.create(course=course, title="M")
        Lesson.objects.create(module=module, title="L", type="reading")
        services.enroll_free(student, course)

    client = APIClient()
    client.force_authenticate(student)

    # Llamada de precalentamiento sin medir: la primera petición no exenta de
    # todo el proceso crea la fila singleton de PlatformSettings
    # (MaintenanceModeMiddleware) y cachea el resultado unos segundos — un
    # costo real pero de una sola vez, ajeno a lo que este test mide.
    client.get("/api/v1/student/dashboard")

    # Con el N+1 original esto habría sido ~1 (auth) + 1 (paginar) + 2×8
    # (progreso) + selects de sesión ≈ 19+; con la anotación, el número de
    # queries no depende de cuántas inscripciones haya en la página.
    with CaptureQueriesContext(connection) as first_batch:
        client.get("/api/v1/student/dashboard")
    queries_for_8 = len(first_batch.captured_queries)

    course = Course.objects.create(slug="dash-extra", title="Extra", organization="museum", is_free=True)
    module = CourseModule.objects.create(course=course, title="M")
    Lesson.objects.create(module=module, title="L", type="reading")
    services.enroll_free(student, course)

    with CaptureQueriesContext(connection) as second_batch:
        client.get("/api/v1/student/dashboard")
    queries_for_9 = len(second_batch.captured_queries)

    assert queries_for_9 == queries_for_8


# ---------------------------------------------------------------------------
# #35: revisar una evidencia notifica al estudiante (antes solo se avisaba
# el envío, nunca la resolución).
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_reviewing_an_evidence_notifies_the_student():
    from apps.notifications.models import Notification

    student = User.objects.create_user(email="ev-student@test.com", password="Testpass123", name="E")
    admin = User.objects.create_user(
        email="ev-admin@test.com", password="Testpass123", name="A", role=User.Role.ADMIN_MUSEUM
    )
    course = Course.objects.create(slug="ev-course", title="EC", organization="museum", is_free=True)
    module = CourseModule.objects.create(course=course, title="M")
    lesson = Lesson.objects.create(module=module, title="L", type="assignment", upload_enabled=True)
    enrollment = services.enroll_free(student, course)
    evidence = Evidence.objects.create(enrollment=enrollment, lesson=lesson, description="tarea")

    client = APIClient()
    client.force_authenticate(admin)
    resp = client.patch(f"/api/v1/admin/evidences/{evidence.id}/review", {"status": "approved"})

    assert resp.status_code == 200
    assert Notification.objects.filter(
        user=student, type=Notification.Type.EVIDENCE, title="Evidencia aprobada"
    ).exists()


@pytest.mark.django_db
def test_editing_only_the_feedback_does_not_send_a_second_notification():
    from apps.notifications.models import Notification

    student = User.objects.create_user(email="ev-student2@test.com", password="Testpass123", name="E2")
    admin = User.objects.create_user(
        email="ev-admin2@test.com", password="Testpass123", name="A2", role=User.Role.ADMIN_MUSEUM
    )
    course = Course.objects.create(slug="ev-course-2", title="EC2", organization="museum", is_free=True)
    module = CourseModule.objects.create(course=course, title="M")
    lesson = Lesson.objects.create(module=module, title="L", type="assignment", upload_enabled=True)
    enrollment = services.enroll_free(student, course)
    evidence = Evidence.objects.create(enrollment=enrollment, lesson=lesson, description="tarea")

    client = APIClient()
    client.force_authenticate(admin)
    client.patch(f"/api/v1/admin/evidences/{evidence.id}/review", {"status": "approved"})
    client.patch(f"/api/v1/admin/evidences/{evidence.id}/review", {"feedback": "Buen trabajo"})

    assert Notification.objects.filter(user=student, type=Notification.Type.EVIDENCE).count() == 1
