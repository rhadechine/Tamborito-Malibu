import pytest
from rest_framework.test import APIClient

from apps.audit.models import AuditLog
from apps.commerce.models import Order
from apps.courses.models import Course
from apps.donations.models import Donation
from apps.identity.models import User
from apps.learning import services as learning_services
from apps.museum.models import MuseumPiece
from apps.settings.models import PlatformSettings


@pytest.fixture
def admin():
    return User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.ADMIN_FOUNDATION
    )


@pytest.fixture
def super_admin():
    return User.objects.create_user(
        email="root@a.com", password="Testpass123", name="Root", role=User.Role.SUPER_ADMIN
    )


@pytest.fixture
def admin_museum():
    return User.objects.create_user(
        email="am@a.com", password="Testpass123", name="AM", role=User.Role.ADMIN_MUSEUM
    )


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.mark.django_db
def test_registering_a_user_writes_an_audit_entry():
    client = APIClient()

    resp = client.post(
        "/api/v1/auth/register",
        {"email": "new@test.com", "password": "Testpass123", "name": "New"},
    )

    assert resp.status_code == 201
    log = AuditLog.objects.get(action="user.registered")
    assert log.entity_type == "User"
    assert log.actor_user.email == "new@test.com"


@pytest.mark.django_db
def test_creating_publishing_and_archiving_a_course_writes_three_audit_entries(admin):
    client = APIClient()
    client.force_authenticate(admin)

    create_resp = client.post(
        "/api/v1/admin/courses",
        {"slug": "c1", "title": "C1", "organization": "foundation", "price": "0.00"},
    )
    course_id = create_resp.data["data"]["id"]

    client.post(f"/api/v1/admin/courses/{course_id}/publish")
    client.post(f"/api/v1/admin/courses/{course_id}/archive")

    # orden por "id" (no por created_at): inserciones tan seguidas pueden
    # empatar en la resolución del timestamp de la base de datos.
    actions = list(
        AuditLog.objects.filter(entity_type="Course", entity_id=course_id).order_by("id").values_list("action", flat=True)
    )
    assert actions == ["course.created", "course.published", "course.archived"]


@pytest.mark.django_db
def test_checkout_writes_an_order_created_audit_entry(student):
    course = Course.objects.create(
        slug="c2", title="C2", organization="museum", price="50.00", status=Course.Status.PUBLISHED
    )
    client = APIClient()
    client.force_authenticate(student)
    client.post("/api/v1/cart/items", {"course_id": course.id})

    client.post("/api/v1/orders/checkout")

    order = Order.objects.get(user=student)
    log = AuditLog.objects.get(action="order.created", entity_id=order.id)
    assert log.actor_user == student


@pytest.mark.django_db
def test_free_enrollment_writes_an_audit_entry(student):
    course = Course.objects.create(slug="c3", title="C3", organization="museum", is_free=True)

    learning_services.enroll_free(student, course)

    assert AuditLog.objects.filter(action="enrollment.created", actor_user=student).exists()


@pytest.mark.django_db
def test_donation_approval_writes_an_audit_entry():
    donation = Donation.objects.create(
        donor_name="D", donor_email="d@d.com", organization_target="museum", amount="100.00"
    )
    from common.events import dispatch

    dispatch("donation.approved", donation=donation)

    log = AuditLog.objects.get(action="donation.approved")
    assert log.entity_type == "Donation"
    assert log.entity_id == donation.id


@pytest.mark.django_db
def test_updating_settings_writes_an_audit_entry_with_the_acting_admin(super_admin):
    client = APIClient()
    client.force_authenticate(super_admin)

    client.patch("/api/v1/admin/settings", {"maintenance_mode": True})

    settings_row = PlatformSettings.objects.load()
    log = AuditLog.objects.get(action="settings.updated")
    assert log.entity_id == settings_row.id
    assert log.actor_user == super_admin


@pytest.mark.django_db
def test_creating_and_updating_a_museum_piece_writes_audit_entries(admin_museum):
    client = APIClient()
    client.force_authenticate(admin_museum)

    create_resp = client.post("/api/v1/admin/museum/pieces", {"name": "P1", "slug": "p1"})
    piece_id = create_resp.data["id"]

    client.patch(f"/api/v1/admin/museum/pieces/{piece_id}", {"status": "published"})

    actions = list(
        AuditLog.objects.filter(entity_type="MuseumPiece", entity_id=piece_id).values_list("action", flat=True)
    )
    assert set(actions) == {"museum.piece.created", "museum.piece.updated"}
    assert MuseumPiece.objects.get(pk=piece_id).status == "published"
