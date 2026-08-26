"""Mapa de capacidades para el panel de administración único.

El test que de verdad importa aquí es el último: comprueba que el mapa y las
permission classes reales no se desincronicen. Sin él, el mapa se convertiría
en documentación que miente y el panel pintaría secciones que devuelven 403.
"""

import pytest
from rest_framework.test import APIClient

from apps.identity.capabilities import CAPABILITIES, capabilities_for
from apps.identity.models import User


@pytest.fixture
def foundation_admin():
    return User.objects.create_user(
        email="cf@test.com", password="Testpass123", name="F", role=User.Role.ADMIN_FOUNDATION
    )


@pytest.fixture
def museum_admin():
    return User.objects.create_user(
        email="cm@test.com", password="Testpass123", name="M", role=User.Role.ADMIN_MUSEUM
    )


@pytest.fixture
def super_admin():
    return User.objects.create_user(
        email="cs@test.com", password="Testpass123", name="S", role=User.Role.SUPER_ADMIN
    )


@pytest.fixture
def plain_client():
    return User.objects.create_user(email="cc@test.com", password="Testpass123", name="C")


def _client(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


def _me(user):
    return _client(user).get("/api/v1/auth/me").data["data"]


@pytest.mark.django_db
def test_a_plain_client_has_no_capabilities(plain_client):
    caps = capabilities_for(plain_client)

    assert set(caps) == set(CAPABILITIES)
    assert not any(caps.values())


@pytest.mark.django_db
def test_the_super_admin_has_every_capability(super_admin):
    assert all(capabilities_for(super_admin).values())


@pytest.mark.django_db
def test_an_organization_admin_has_content_but_not_finance(foundation_admin):
    caps = capabilities_for(foundation_admin)

    assert caps["content.courses"] is True
    assert caps["content.library"] is True
    assert caps["learning.enrollments"] is True
    assert caps["certificates.revoke"] is True
    assert caps["users.manage"] is True

    assert caps["finance.reports"] is False
    assert caps["finance.orders"] is False
    assert caps["finance.payments"] is False
    assert caps["platform.settings"] is False
    assert caps["users.manage_admins"] is False


@pytest.mark.django_db
def test_the_museum_section_only_appears_for_a_scope_that_reaches_it(foundation_admin, museum_admin):
    assert capabilities_for(foundation_admin)["content.museum"] is False
    assert capabilities_for(museum_admin)["content.museum"] is True


@pytest.mark.django_db
def test_an_explicit_scope_changes_the_capabilities(foundation_admin):
    assert capabilities_for(foundation_admin)["content.museum"] is False

    foundation_admin.organization_scope = User.OrganizationScope.BOTH
    foundation_admin.save(update_fields=["organization_scope"])

    assert capabilities_for(foundation_admin)["content.museum"] is True


# --- Exposición en /auth/me ----------------------------------------------


@pytest.mark.django_db
def test_me_exposes_the_resolved_scope_and_capabilities(museum_admin):
    data = _me(museum_admin)

    # El scope explícito está vacío; el panel necesita el ya resuelto.
    assert data["organization_scope"] == ""
    assert data["effective_scope"] == "museum"
    assert data["allowed_organizations"] == ["both", "museum"]
    assert data["capabilities"]["content.museum"] is True
    assert data["capabilities"]["finance.reports"] is False


@pytest.mark.django_db
def test_me_works_for_a_plain_client(plain_client):
    data = _me(plain_client)

    assert data["effective_scope"] is None
    assert data["allowed_organizations"] == []
    assert not any(data["capabilities"].values())


@pytest.mark.django_db
def test_patching_the_profile_still_works_and_returns_capabilities(museum_admin):
    resp = _client(museum_admin).patch("/api/v1/users/me", {"city": "Barranquilla"}, format="json")

    assert resp.status_code == 200
    assert resp.data["data"]["city"] == "Barranquilla"
    assert resp.data["data"]["capabilities"]["content.museum"] is True


@pytest.mark.django_db
def test_the_admin_user_list_stays_lean(super_admin):
    row = _client(super_admin).get("/api/v1/admin/users").data["data"][0]

    # El bloque de capacidades es solo para el usuario en sesión.
    assert "capabilities" not in row
    assert "effective_scope" not in row


# --- El mapa no puede mentir ---------------------------------------------

# (capacidad, método, url) — un endpoint representativo por capacidad.
CAPABILITY_PROBES = [
    ("content.courses", "get", "/api/v1/admin/courses"),
    ("content.pages", "get", "/api/v1/admin/pages"),
    ("content.library", "get", "/api/v1/admin/library/resources"),
    ("content.museum", "get", "/api/v1/admin/museum/pieces"),
    ("learning.enrollments", "get", "/api/v1/admin/enrollments"),
    ("learning.evidences", "get", "/api/v1/admin/evidences"),
    ("finance.reports", "get", "/api/v1/admin/reports/summary"),
    ("finance.orders", "get", "/api/v1/admin/orders"),
    ("finance.donations", "get", "/api/v1/admin/donations"),
    ("platform.settings", "get", "/api/v1/admin/settings"),
    ("users.manage", "get", "/api/v1/admin/users"),
]


@pytest.mark.django_db
@pytest.mark.parametrize("capability,method,url", CAPABILITY_PROBES)
@pytest.mark.parametrize("role", ["admin_foundation", "admin_museum", "super_admin"])
def test_the_capability_map_agrees_with_the_real_permissions(capability, method, url, role):
    user = User.objects.create_user(
        email=f"probe-{role}@test.com", password="Testpass123", name="P", role=role
    )
    caps = capabilities_for(user)

    resp = getattr(_client(user), method)(url)

    allowed_by_api = resp.status_code != 403
    assert allowed_by_api == caps[capability], (
        f"{role}: el mapa dice {caps[capability]} para «{capability}» "
        f"pero {method.upper()} {url} respondió {resp.status_code}"
    )


@pytest.mark.django_db
def test_every_probed_capability_exists_in_the_map():
    probed = {capability for capability, _method, _url in CAPABILITY_PROBES}

    assert probed <= set(CAPABILITIES)
