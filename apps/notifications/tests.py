import pytest
from rest_framework.test import APIClient

from apps.courses.models import Course
from apps.identity.models import User
from apps.learning import services as learning_services
from apps.notifications.models import Notification


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.mark.django_db
def test_student_only_sees_their_own_notifications(student):
    other = User.objects.create_user(email="o@o.com", password="Testpass123", name="O")
    Notification.objects.create(user=other, title="Ajena")
    Notification.objects.create(user=student, title="Mía")
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get("/api/v1/notifications")

    titles = [n["title"] for n in resp.data["data"]]
    assert titles == ["Mía"]


@pytest.mark.django_db
def test_mark_one_notification_as_read(student):
    notification = Notification.objects.create(user=student, title="N1")
    client = APIClient()
    client.force_authenticate(student)

    resp = client.patch(f"/api/v1/notifications/{notification.id}/read")

    assert resp.status_code == 200
    notification.refresh_from_db()
    assert notification.read is True


@pytest.mark.django_db
def test_mark_all_notifications_as_read(student):
    Notification.objects.create(user=student, title="N1")
    Notification.objects.create(user=student, title="N2")
    client = APIClient()
    client.force_authenticate(student)

    client.patch("/api/v1/notifications/read-all")

    assert not Notification.objects.filter(user=student, read=False).exists()


@pytest.mark.django_db
def test_student_cannot_mark_another_students_notification_as_read(student):
    other = User.objects.create_user(email="o@o.com", password="Testpass123", name="O")
    notification = Notification.objects.create(user=other, title="Ajena")
    client = APIClient()
    client.force_authenticate(student)

    resp = client.patch(f"/api/v1/notifications/{notification.id}/read")

    assert resp.status_code == 404


@pytest.mark.django_db
def test_admin_can_send_a_manual_notification(student):
    admin = User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.ADMIN_FOUNDATION
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(
        "/api/v1/admin/notifications",
        {"user_id": student.id, "title": "Aviso", "message": "Hola"},
    )

    assert resp.status_code == 201
    assert Notification.objects.filter(user=student, title="Aviso").exists()


@pytest.mark.django_db
def test_student_cannot_send_notifications(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/admin/notifications", {"user_id": student.id, "title": "X"})

    assert resp.status_code == 403


# --- Integración: enrollment.created dispara una notificación real ---


@pytest.mark.django_db
def test_free_enrollment_dispatches_an_enrollment_notification(student):
    course = Course.objects.create(slug="free", title="Curso libre", organization="museum", is_free=True)

    learning_services.enroll_free(student, course)

    assert Notification.objects.filter(
        user=student, type=Notification.Type.ENROLLMENT
    ).exists()


@pytest.mark.django_db
def test_duplicate_enroll_free_call_does_not_duplicate_the_notification(student):
    course = Course.objects.create(slug="free2", title="Curso libre 2", organization="museum", is_free=True)

    learning_services.enroll_free(student, course)
    learning_services.enroll_free(student, course)

    assert Notification.objects.filter(user=student, type=Notification.Type.ENROLLMENT).count() == 1


@pytest.mark.django_db
def test_account_status_change_dispatches_a_notification(student):
    admin = User.objects.create_user(
        email="a2@a.com", password="Testpass123", name="A2", role=User.Role.SUPER_ADMIN
    )
    client = APIClient()
    client.force_authenticate(admin)

    client.patch(f"/api/v1/admin/users/{student.id}/status", {"status": "suspended"})

    assert Notification.objects.filter(user=student, type=Notification.Type.ACCOUNT).exists()
