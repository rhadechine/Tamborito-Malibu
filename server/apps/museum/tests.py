import pytest
from rest_framework.test import APIClient

from apps.identity.models import User
from apps.museum.models import CollectionGroup, MuseumExhibition, MuseumPiece, Status


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.fixture
def admin_museum():
    return User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.ADMIN_MUSEUM
    )


@pytest.mark.django_db
def test_public_pieces_only_show_published_ones():
    MuseumPiece.objects.create(name="Publicada", slug="publicada", status=Status.PUBLISHED)
    MuseumPiece.objects.create(name="Borrador", slug="borrador", status=Status.DRAFT)
    client = APIClient()

    resp = client.get("/api/v1/museum/pieces")

    slugs = [p["slug"] for p in resp.data["data"]]
    assert slugs == ["publicada"]


@pytest.mark.django_db
def test_pieces_can_be_filtered_by_collection_group():
    group_a = CollectionGroup.objects.create(title="A", slug="a", status=Status.PUBLISHED)
    group_b = CollectionGroup.objects.create(title="B", slug="b", status=Status.PUBLISHED)
    MuseumPiece.objects.create(name="P1", slug="p1", collection_group=group_a, status=Status.PUBLISHED)
    MuseumPiece.objects.create(name="P2", slug="p2", collection_group=group_b, status=Status.PUBLISHED)
    client = APIClient()

    resp = client.get(f"/api/v1/museum/pieces?collection_group_id={group_a.id}")

    assert [p["slug"] for p in resp.data["data"]] == ["p1"]


@pytest.mark.django_db
def test_draft_piece_detail_is_not_publicly_visible():
    MuseumPiece.objects.create(name="Borrador", slug="borrador", status=Status.DRAFT)
    client = APIClient()

    resp = client.get("/api/v1/museum/pieces/borrador")

    assert resp.status_code == 404


@pytest.mark.django_db
def test_public_exhibitions_only_show_published_ones():
    MuseumExhibition.objects.create(title="Activa", status=Status.PUBLISHED)
    MuseumExhibition.objects.create(title="Borrador", status=Status.DRAFT)
    client = APIClient()

    resp = client.get("/api/v1/museum/exhibitions")

    titles = [e["title"] for e in resp.data["data"]]
    assert titles == ["Activa"]


@pytest.mark.django_db
def test_museum_admin_can_create_a_collection_group(admin_museum):
    client = APIClient()
    client.force_authenticate(admin_museum)

    resp = client.post(
        "/api/v1/admin/museum/collection-groups", {"title": "Cerámica", "slug": "ceramica"}
    )

    assert resp.status_code == 201
    assert CollectionGroup.objects.filter(slug="ceramica").exists()


@pytest.mark.django_db
def test_museum_admin_can_publish_a_piece(admin_museum):
    piece = MuseumPiece.objects.create(name="P1", slug="p1")
    client = APIClient()
    client.force_authenticate(admin_museum)

    resp = client.patch(f"/api/v1/admin/museum/pieces/{piece.id}", {"status": "published"})

    assert resp.status_code == 200
    piece.refresh_from_db()
    assert piece.status == Status.PUBLISHED


@pytest.mark.django_db
def test_museum_admin_can_create_and_publish_an_exhibition(admin_museum):
    client = APIClient()
    client.force_authenticate(admin_museum)

    resp = client.post(
        "/api/v1/admin/museum/exhibitions",
        {"title": "Ruta del oro", "type": "temporary", "status": "published"},
    )

    assert resp.status_code == 201
    exhibition = MuseumExhibition.objects.get(title="Ruta del oro")
    assert exhibition.status == Status.PUBLISHED

    public_resp = APIClient().get("/api/v1/museum/exhibitions")
    assert "Ruta del oro" in [e["title"] for e in public_resp.data["data"]]


@pytest.mark.django_db
def test_museum_admin_can_update_and_delete_an_exhibition(admin_museum):
    exhibition = MuseumExhibition.objects.create(title="Vieja", status=Status.DRAFT)
    client = APIClient()
    client.force_authenticate(admin_museum)

    resp = client.patch(f"/api/v1/admin/museum/exhibitions/{exhibition.id}", {"status": "archived"})
    assert resp.status_code == 200
    exhibition.refresh_from_db()
    assert exhibition.status == Status.ARCHIVED

    resp = client.delete(f"/api/v1/admin/museum/exhibitions/{exhibition.id}")
    assert resp.status_code == 204
    assert not MuseumExhibition.objects.filter(id=exhibition.id).exists()


@pytest.mark.django_db
def test_student_cannot_manage_museum_exhibitions(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/admin/museum/exhibitions", {"title": "X"})

    assert resp.status_code == 403


@pytest.mark.django_db
def test_student_cannot_manage_museum_pieces(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/admin/museum/pieces", {"name": "P1", "slug": "p1"})

    assert resp.status_code == 403
