import pytest
from rest_framework.test import APIClient

from apps.donations.models import Donation
from apps.identity.models import User


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.mark.django_db
def test_anyone_can_create_a_donation_without_authenticating():
    client = APIClient()

    resp = client.post(
        "/api/v1/donations",
        {
            "donor_name": "Ana",
            "donor_email": "ana@example.com",
            "organization_target": "museum",
            "amount": "50000.00",
        },
    )

    assert resp.status_code == 201
    assert resp.data["data"]["status"] == "pending"
    assert Donation.objects.get().donor_user is None


@pytest.mark.django_db
def test_authenticated_donor_is_linked_to_the_donation(student):
    client = APIClient()
    client.force_authenticate(student)

    client.post(
        "/api/v1/donations",
        {
            "donor_name": "S",
            "donor_email": "s@s.com",
            "organization_target": "foundation",
            "amount": "10000.00",
        },
    )

    assert Donation.objects.get().donor_user == student


@pytest.mark.django_db
def test_student_only_sees_their_own_donations(student):
    other = User.objects.create_user(email="o@o.com", password="Testpass123", name="O")
    Donation.objects.create(
        donor_user=other, donor_name="O", donor_email="o@o.com",
        organization_target="museum", amount="100.00",
    )
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get("/api/v1/student/donations")

    assert resp.data["data"] == []


@pytest.mark.django_db
def test_admin_approving_a_donation_sets_confirmed_at(student):
    admin = User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.SUPER_ADMIN
    )
    donation = Donation.objects.create(
        donor_user=student, donor_name="S", donor_email="s@s.com",
        organization_target="foundation", amount="10000.00",
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.patch(f"/api/v1/admin/donations/{donation.id}", {"status": "approved"})

    assert resp.status_code == 200
    donation.refresh_from_db()
    assert donation.confirmed_at is not None


@pytest.mark.django_db
def test_student_cannot_access_admin_donations(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get("/api/v1/admin/donations")

    assert resp.status_code == 403
