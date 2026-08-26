import pytest
from rest_framework.test import APIClient

from apps.courses.models import Course
from apps.identity.models import User
from apps.learning import services as learning_services
from apps.library.models import LibraryResource, ResourceAccessLog


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.fixture
def published_resource():
    return LibraryResource.objects.create(
        title="Guía", slug="guia", type="link", organization="museum",
        external_url="https://example.com/guia.pdf", status=LibraryResource.Status.PUBLISHED,
    )


@pytest.mark.django_db
def test_public_list_only_shows_published_resources(published_resource):
    LibraryResource.objects.create(title="Borrador", slug="borrador", type="link", organization="museum")
    client = APIClient()

    resp = client.get("/api/v1/library/resources")

    slugs = [r["slug"] for r in resp.data["data"]]
    assert slugs == ["guia"]


@pytest.mark.django_db
def test_anyone_can_get_download_url_for_a_public_resource(published_resource):
    client = APIClient()

    resp = client.get(f"/api/v1/library/resources/{published_resource.id}/download-url")

    assert resp.status_code == 200
    assert resp.data["data"]["url"] == "https://example.com/guia.pdf"


@pytest.mark.django_db
def test_anonymous_user_cannot_download_a_private_resource():
    resource = LibraryResource.objects.create(
        title="Privado", slug="privado", type="link", organization="museum",
        access=LibraryResource.Access.PRIVATE, external_url="https://example.com/privado.pdf",
        status=LibraryResource.Status.PUBLISHED,
    )
    client = APIClient()

    resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")

    assert resp.status_code == 403


@pytest.mark.django_db
def test_authenticated_user_can_download_a_private_resource(student):
    resource = LibraryResource.objects.create(
        title="Privado", slug="privado", type="link", organization="museum",
        access=LibraryResource.Access.PRIVATE, external_url="https://example.com/privado.pdf",
        status=LibraryResource.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")

    assert resp.status_code == 200


@pytest.mark.django_db
def test_enrolled_only_resource_is_blocked_for_a_student_without_enrollment(student):
    course = Course.objects.create(slug="c1", title="C1", organization="museum", is_free=True)
    resource = LibraryResource.objects.create(
        title="Material del curso", slug="material", type="document", organization="museum",
        access=LibraryResource.Access.ENROLLED_ONLY, course=course, external_url="https://example.com/m.pdf",
        status=LibraryResource.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")

    assert resp.status_code == 403


@pytest.mark.django_db
def test_enrolled_only_resource_is_allowed_once_the_student_is_enrolled(student):
    course = Course.objects.create(slug="c2", title="C2", organization="museum", is_free=True)
    resource = LibraryResource.objects.create(
        title="Material del curso", slug="material-2", type="document", organization="museum",
        access=LibraryResource.Access.ENROLLED_ONLY, course=course, external_url="https://example.com/m.pdf",
        status=LibraryResource.Status.PUBLISHED,
    )
    learning_services.enroll_free(student, course)
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")

    assert resp.status_code == 200


@pytest.mark.django_db
def test_purchased_only_resource_rejects_a_free_enrollment(student):
    course = Course.objects.create(slug="c3", title="C3", organization="museum", is_free=True)
    resource = LibraryResource.objects.create(
        title="Material exclusivo", slug="material-3", type="document", organization="museum",
        access=LibraryResource.Access.PURCHASED_ONLY, course=course, external_url="https://example.com/m.pdf",
        status=LibraryResource.Status.PUBLISHED,
    )
    learning_services.enroll_free(student, course)
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")

    assert resp.status_code == 403


@pytest.mark.django_db
def test_purchased_only_resource_is_allowed_after_an_order_enrollment(student):
    from apps.commerce.models import Order, OrderItem

    course = Course.objects.create(slug="c4", title="C4", organization="museum", price="100.00")
    resource = LibraryResource.objects.create(
        title="Material exclusivo", slug="material-4", type="document", organization="museum",
        access=LibraryResource.Access.PURCHASED_ONLY, course=course, external_url="https://example.com/m.pdf",
        status=LibraryResource.Status.PUBLISHED,
    )
    order = Order.objects.create(user=student, subtotal="100.00", total="100.00")
    OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="100.00")
    learning_services.enroll_from_order(order)
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")

    assert resp.status_code == 200


@pytest.mark.django_db
def test_view_log_records_an_anonymous_view(published_resource):
    client = APIClient()

    resp = client.post(f"/api/v1/library/resources/{published_resource.id}/view-log")

    assert resp.status_code == 201
    log = ResourceAccessLog.objects.get()
    assert log.user is None
    assert log.resource == published_resource


@pytest.mark.django_db
def test_admin_can_create_and_publish_a_resource():
    admin = User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.ADMIN_MUSEUM
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(
        "/api/v1/admin/library/resources",
        {"title": "Nuevo", "slug": "nuevo", "type": "document", "organization": "museum", "status": "published"},
    )

    assert resp.status_code == 201
    assert LibraryResource.objects.get(slug="nuevo").status == LibraryResource.Status.PUBLISHED


@pytest.mark.django_db
def test_student_cannot_create_a_resource(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post(
        "/api/v1/admin/library/resources",
        {"title": "Nuevo", "slug": "nuevo", "type": "document", "organization": "museum"},
    )

    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Access levels (sección 21): antes se podían saltar por dos vías — un
# recurso restringido sin curso asociado se abría a cualquier usuario
# autenticado, y el serializer público exponía `external_url` de cualquier
# recurso, lo que permitía consumirlo sin pasar por `download-url`.
# ---------------------------------------------------------------------------


@pytest.mark.parametrize("access", ["enrolled_only", "purchased_only"])
@pytest.mark.django_db
def test_restricted_resource_without_course_fails_closed(student, access):
    resource = LibraryResource.objects.create(
        title="Sin curso", slug=f"sin-curso-{access}", type="document", organization="museum",
        access=access, course=None, external_url="https://example.com/x.pdf",
        status=LibraryResource.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")

    assert resp.status_code == 403


@pytest.mark.django_db
def test_public_listing_does_not_leak_the_url_of_a_restricted_resource(student):
    course = Course.objects.create(slug="c5", title="C5", organization="museum", price="100.00")
    LibraryResource.objects.create(
        title="Exclusivo", slug="exclusivo", type="document", organization="museum",
        access=LibraryResource.Access.PURCHASED_ONLY, course=course,
        external_url="https://example.com/secreto.pdf", status=LibraryResource.Status.PUBLISHED,
    )

    anon = APIClient().get("/api/v1/library/resources").data["data"]
    detail = APIClient().get("/api/v1/library/resources/exclusivo").data

    assert anon[0]["external_url"] == ""
    assert detail["external_url"] == ""
    # ...y tampoco aparece la referencia al MediaAsset.
    assert "media" not in detail


@pytest.mark.django_db
def test_public_resource_still_exposes_its_url(published_resource):
    data = APIClient().get("/api/v1/library/resources").data["data"]

    assert data[0]["external_url"] == "https://example.com/guia.pdf"


@pytest.mark.django_db
def test_download_endpoint_reverifies_access_for_a_restricted_resource(student, tmp_path, settings):
    from django.core.files.uploadedfile import SimpleUploadedFile

    from apps.media.models import MediaAsset

    settings.MEDIA_ROOT = tmp_path
    course = Course.objects.create(slug="c6", title="C6", organization="museum", is_free=True)
    media = MediaAsset.objects.create(
        organization="museum", file_name="m.txt", original_name="m.txt",
        storage_path="m.txt", mime_type="text/plain",
        file=SimpleUploadedFile("m.txt", b"contenido"),
    )
    resource = LibraryResource.objects.create(
        title="Material", slug="material-dl", type="document", organization="museum",
        access=LibraryResource.Access.ENROLLED_ONLY, course=course, media=media,
        status=LibraryResource.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)

    # Sin inscripción: 403 tanto en la URL como en los bytes.
    assert client.get(f"/api/v1/library/resources/{resource.id}/download-url").status_code == 403
    assert client.get(f"/api/v1/library/resources/{resource.id}/download").status_code == 403

    learning_services.enroll_free(student, course)

    url_resp = client.get(f"/api/v1/library/resources/{resource.id}/download-url")
    assert url_resp.status_code == 200
    assert url_resp.data["data"]["url"].endswith(f"/api/v1/library/resources/{resource.id}/download")
    assert client.get(f"/api/v1/library/resources/{resource.id}/download").status_code == 200
