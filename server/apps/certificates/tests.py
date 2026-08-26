import pytest
from rest_framework.test import APIClient

from apps.certificates.models import Certificate
from apps.courses.models import Course, CourseModule, Lesson
from apps.identity.models import User
from apps.learning import services as learning_services
from apps.learning.models import Enrollment
from apps.notifications.models import Notification


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.fixture
def course_with_certificate():
    course = Course.objects.create(
        slug="c1", title="C1", organization="museum", is_free=True, certificate_enabled=True
    )
    module = CourseModule.objects.create(course=course, title="M1")
    lesson = Lesson.objects.create(module=module, title="L1", type="reading")
    return course, lesson


@pytest.mark.django_db
def test_completing_a_course_with_certificates_enabled_issues_one(student, course_with_certificate):
    course, lesson = course_with_certificate
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)

    learning_services.mark_lesson_complete(enrollment, lesson)

    certificate = Certificate.objects.get(user=student, course=course)
    assert certificate.revoked_at is None
    assert certificate.code.startswith("CERT-")


@pytest.mark.django_db
def test_completing_a_course_dispatches_a_certificate_notification(student, course_with_certificate):
    course, lesson = course_with_certificate
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)

    learning_services.mark_lesson_complete(enrollment, lesson)

    assert Notification.objects.filter(user=student, type=Notification.Type.CERTIFICATE).exists()


@pytest.mark.django_db
def test_completing_a_course_without_certificates_enabled_issues_nothing(student):
    course = Course.objects.create(slug="c2", title="C2", organization="museum", is_free=True)
    module = CourseModule.objects.create(course=course, title="M1")
    lesson = Lesson.objects.create(module=module, title="L1", type="reading")
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)

    learning_services.mark_lesson_complete(enrollment, lesson)

    assert not Certificate.objects.filter(user=student, course=course).exists()


@pytest.mark.django_db
def test_student_can_list_and_retrieve_their_own_certificate(student, course_with_certificate):
    course, lesson = course_with_certificate
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)
    learning_services.mark_lesson_complete(enrollment, lesson)
    certificate = Certificate.objects.get(user=student, course=course)
    client = APIClient()
    client.force_authenticate(student)

    list_resp = client.get("/api/v1/student/certificates")
    assert len(list_resp.data["data"]) == 1

    detail_resp = client.get(f"/api/v1/student/certificates/{certificate.id}")
    assert detail_resp.data["data"]["code"] == certificate.code


@pytest.mark.django_db
def test_anyone_can_verify_a_valid_certificate_by_code(student, course_with_certificate):
    course, lesson = course_with_certificate
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)
    learning_services.mark_lesson_complete(enrollment, lesson)
    certificate = Certificate.objects.get(user=student, course=course)
    client = APIClient()

    resp = client.get(f"/api/v1/certificates/verify/{certificate.code}")

    assert resp.status_code == 200
    assert resp.data["data"]["valid"] is True
    assert resp.data["data"]["holder_name"] == "S"


@pytest.mark.django_db
def test_admin_can_revoke_a_certificate(student, course_with_certificate):
    course, lesson = course_with_certificate
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)
    learning_services.mark_lesson_complete(enrollment, lesson)
    certificate = Certificate.objects.get(user=student, course=course)
    admin = User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.ADMIN_MUSEUM
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(f"/api/v1/admin/certificates/{certificate.id}/revoke")
    assert resp.status_code == 200

    verify_resp = APIClient().get(f"/api/v1/certificates/verify/{certificate.code}")
    assert verify_resp.data["data"]["valid"] is False


@pytest.mark.django_db
def test_student_cannot_revoke_certificates(student, course_with_certificate):
    course, lesson = course_with_certificate
    enrollment = Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)
    learning_services.mark_lesson_complete(enrollment, lesson)
    certificate = Certificate.objects.get(user=student, course=course)
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post(f"/api/v1/admin/certificates/{certificate.id}/revoke")

    assert resp.status_code == 403
