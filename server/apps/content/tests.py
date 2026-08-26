import pytest
from rest_framework.test import APIClient

from apps.content.models import Page, PageSection
from apps.content.views import PagePublicView
from apps.identity.models import User


@pytest.mark.django_db
def test_public_view_hides_draft_pages():
    Page.objects.create(slug="draft-page", organization="foundation", title="D", status=Page.Status.DRAFT)
    published = Page.objects.create(
        slug="live-page", organization="museum", title="L", status=Page.Status.PUBLISHED
    )

    qs = PagePublicView.queryset
    assert list(qs.values_list("id", flat=True)) == [published.id]


@pytest.fixture
def admin():
    return User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.ADMIN_FOUNDATION
    )


@pytest.mark.django_db
def test_admin_can_retrieve_a_single_page(admin):
    page = Page.objects.create(slug="p1", organization="foundation", title="P1")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get(f"/api/v1/admin/pages/{page.id}")

    assert resp.status_code == 200
    assert resp.data["data"]["slug"] == "p1"


@pytest.mark.django_db
def test_admin_can_retrieve_a_single_page_section(admin):
    page = Page.objects.create(slug="p2", organization="foundation", title="P2")
    section = PageSection.objects.create(page=page, type="hero", title="Hero")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get(f"/api/v1/admin/page-sections/{section.id}")

    assert resp.status_code == 200
    assert resp.data["data"]["title"] == "Hero"
