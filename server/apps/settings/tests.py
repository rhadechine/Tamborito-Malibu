import pytest
from rest_framework.test import APIClient

from apps.identity.models import User
from apps.settings.models import PlatformSettings


@pytest.fixture
def admin():
    return User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.SUPER_ADMIN
    )


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.mark.django_db
def test_get_settings_creates_the_singleton_with_defaults_on_first_access(admin):
    assert not PlatformSettings.objects.exists()
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get("/api/v1/admin/settings")

    assert resp.status_code == 200
    assert resp.data["data"]["platform_name"] == "Tamborito–Malibú"
    assert PlatformSettings.objects.count() == 1


@pytest.mark.django_db
def test_patch_settings_updates_fields_without_creating_a_second_row(admin):
    client = APIClient()
    client.force_authenticate(admin)
    client.get("/api/v1/admin/settings")  # crea la fila

    resp = client.patch(
        "/api/v1/admin/settings",
        {"contact_email": "hola@tamborito.org", "maintenance_mode": True, "feature_flags": {"new_checkout": True}},
        format="json",
    )

    assert resp.status_code == 200
    assert resp.data["data"]["contact_email"] == "hola@tamborito.org"
    assert resp.data["data"]["maintenance_mode"] is True
    assert resp.data["data"]["feature_flags"] == {"new_checkout": True}
    assert PlatformSettings.objects.count() == 1


@pytest.mark.django_db
def test_settings_cannot_be_reached_twice_as_two_different_rows(admin):
    PlatformSettings.objects.load()
    PlatformSettings.objects.load()

    assert PlatformSettings.objects.count() == 1


@pytest.mark.django_db
def test_student_cannot_read_settings(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get("/api/v1/admin/settings")

    assert resp.status_code == 403


@pytest.mark.django_db
def test_student_cannot_patch_settings(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.patch("/api/v1/admin/settings", {"maintenance_mode": True})

    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# #27a: endpoint público de branding/contacto, sin sesión.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_public_settings_endpoint_works_without_authentication():
    resp = APIClient().get("/api/v1/settings")

    assert resp.status_code == 200
    assert resp.data["data"]["platform_name"] == "Tamborito–Malibú"


@pytest.mark.django_db
def test_public_settings_endpoint_hides_sensitive_fields(admin):
    client = APIClient()
    client.force_authenticate(admin)
    client.patch(
        "/api/v1/admin/settings",
        {"feature_flags": {"secret_toggle": True}, "contact_address": "Calle privada 123"},
        format="json",
    )

    data = APIClient().get("/api/v1/settings").data["data"]

    assert "feature_flags" not in data
    assert "contact_address" not in data


@pytest.mark.django_db
def test_public_settings_endpoint_is_read_only():
    resp = APIClient().patch("/api/v1/settings", {"platform_name": "Hackeado"}, format="json")

    assert resp.status_code in (403, 405)
    assert PlatformSettings.objects.load().platform_name == "Tamborito–Malibú"


# ---------------------------------------------------------------------------
# #27b: `maintenance_mode` ahora bloquea de verdad el tráfico público de la
# API, con las excepciones necesarias para que un admin pueda desactivarlo.
# ---------------------------------------------------------------------------


def _set_maintenance(admin, active):
    client = APIClient()
    client.force_authenticate(admin)
    client.patch("/api/v1/admin/settings", {"maintenance_mode": active}, format="json")


@pytest.mark.django_db
def test_maintenance_mode_blocks_a_public_endpoint(admin):
    _set_maintenance(admin, True)

    resp = APIClient().get("/api/v1/courses")

    assert resp.status_code == 503
    assert resp.json()["error"]["code"] == "MAINTENANCE"


@pytest.mark.django_db
def test_maintenance_mode_does_not_block_health_settings_auth_or_admin(admin, student):
    _set_maintenance(admin, True)
    student_client = APIClient()
    student_client.force_authenticate(student)

    assert APIClient().get("/api/v1/health").status_code in (200, 503)  # nunca el 503 "de mantenimiento"
    assert APIClient().get("/api/v1/settings").status_code == 200
    assert APIClient().post(
        "/api/v1/auth/login", {"email": "a@a.com", "password": "Testpass123"}, format="json"
    ).status_code == 200
    # Un admin puede seguir operando (y desactivar el mantenimiento) sin que
    # el middleware se lo impida — la vista decide el permiso, no el modo.
    admin_client = APIClient()
    admin_client.force_authenticate(admin)
    assert admin_client.get("/api/v1/admin/settings").status_code == 200


@pytest.mark.django_db
def test_maintenance_mode_off_lets_everything_through(admin):
    _set_maintenance(admin, True)
    _set_maintenance(admin, False)

    assert APIClient().get("/api/v1/courses").status_code == 200


@pytest.mark.django_db
def test_health_check_response_distinguishes_its_own_503_from_maintenance(admin):
    # El 503 de /health (dependencias caídas) no debe confundirse con el 503
    # de mantenimiento: son dos cosas distintas y health nunca se bloquea.
    _set_maintenance(admin, True)

    resp = APIClient().get("/api/v1/health")

    assert "checks" in resp.json()["data"]
