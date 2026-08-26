import pytest
from django.db import IntegrityError, transaction
from rest_framework.test import APIClient

from apps.identity.models import User
from common.permissions import IsAdminRole


@pytest.mark.django_db
def test_create_user_hashes_password_and_defaults_role():
    user = User.objects.create_user(email="a@a.com", password="s3cret-pass", name="A")
    assert user.check_password("s3cret-pass")
    assert user.role == User.Role.CLIENT
    assert not user.is_admin


def test_is_admin_role_permission_by_role():
    admin = User(role=User.Role.ADMIN_MUSEUM)
    client = User(role=User.Role.CLIENT)
    perm = IsAdminRole()

    class Req:
        def __init__(self, user):
            self.user = user

    assert perm.has_permission(Req(admin), None) is True
    assert perm.has_permission(Req(client), None) is False


# ---------------------------------------------------------------------------
# Inserción en base de datos: los tests siguientes NO confían en el objeto
# Python devuelto por el manager, sino que vuelven a consultar la fila con
# una query nueva (`User.objects.get(...)`) para confirmar que lo que quedó
# escrito en PostgreSQL es exactamente lo esperado.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_create_user_persists_expected_fields_in_db():
    User.objects.create_user(
        email="persist@test.com",
        password="s3cret-pass",
        name="Persist Test",
        phone="+57 300 0000000",
        city="Bogotá",
    )

    row = User.objects.get(email="persist@test.com")

    assert row.name == "Persist Test"
    assert row.phone == "+57 300 0000000"
    assert row.city == "Bogotá"
    assert row.pk is not None


@pytest.mark.django_db
def test_password_is_hashed_not_stored_in_plaintext():
    User.objects.create_user(email="hash@test.com", password="s3cret-pass", name="Hash")

    row = User.objects.get(email="hash@test.com")

    assert row.password != "s3cret-pass"
    assert row.password.startswith("argon2$") or row.password.startswith("pbkdf2_")
    assert row.check_password("s3cret-pass")


@pytest.mark.django_db
def test_default_field_values_are_persisted():
    User.objects.create_user(email="defaults@test.com", password="s3cret-pass", name="Def")

    row = User.objects.get(email="defaults@test.com")

    assert row.role == User.Role.CLIENT
    assert row.status == User.Status.ACTIVE
    assert row.is_active is True
    assert row.is_staff is False
    assert row.organization_scope == ""


@pytest.mark.django_db
def test_created_at_and_updated_at_are_set_on_insert():
    user = User.objects.create_user(email="timestamps@test.com", password="s3cret-pass", name="T")

    row = User.objects.get(pk=user.pk)

    assert row.created_at is not None
    assert row.updated_at is not None


@pytest.mark.django_db
def test_create_user_without_email_does_not_insert_row():
    with pytest.raises(ValueError):
        User.objects.create_user(email="", password="s3cret-pass", name="No Email")

    assert User.objects.filter(name="No Email").count() == 0


@pytest.mark.django_db
def test_duplicate_email_is_rejected_at_db_level():
    User.objects.create_user(email="dup@test.com", password="s3cret-pass", name="Original")

    with pytest.raises(IntegrityError), transaction.atomic():
        User.objects.create_user(email="dup@test.com", password="other-pass", name="Duplicate")

    # Solo debe existir la primera fila; el intento fallido no dejó rastro.
    assert User.objects.filter(email="dup@test.com").count() == 1


@pytest.mark.django_db
def test_email_is_normalized_before_insert():
    User.objects.create_user(email="Mixed.Case@Test.COM", password="s3cret-pass", name="Norm")

    assert User.objects.filter(email__iexact="mixed.case@test.com").exists()
    row = User.objects.get(name="Norm")
    # Todo el correo en minúsculas, no solo el dominio (sección 13): dos
    # variantes de mayúsculas nunca deben poder registrarse como cuentas
    # distintas, y eso exige normalizar también la parte local.
    assert row.email == "mixed.case@test.com"


@pytest.mark.django_db
def test_create_superuser_persists_expected_flags_in_db():
    User.objects.create_superuser(email="root@test.com", password="s3cret-pass", name="Root")

    row = User.objects.get(email="root@test.com")

    assert row.is_staff is True
    assert row.is_superuser is True
    assert row.role == User.Role.SUPER_ADMIN


@pytest.mark.django_db
def test_register_endpoint_inserts_row_in_db():
    client = APIClient()
    payload = {
        "email": "api-register@test.com",
        "password": "S3gura-pass-123",
        "name": "Api Register",
        "phone": "3000000000",
        "city": "Medellín",
    }

    before = User.objects.count()
    response = client.post("/api/v1/auth/register", payload, format="json")

    assert response.status_code == 201
    assert User.objects.count() == before + 1

    row = User.objects.get(email="api-register@test.com")
    assert row.name == "Api Register"
    assert row.city == "Medellín"
    assert row.check_password("S3gura-pass-123")
    # La respuesta nunca debe filtrar el hash de contraseña.
    assert "password" not in response.data["data"]


@pytest.mark.django_db
def test_admin_can_retrieve_a_single_users_full_metadata():
    User.objects.create_user(email="target@test.com", password="s3cret-pass", name="Target")
    admin = User.objects.create_user(
        email="admin-view@test.com", password="s3cret-pass", name="Admin", role=User.Role.SUPER_ADMIN
    )
    target = User.objects.get(email="target@test.com")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get(f"/api/v1/admin/users/{target.id}/status")

    assert resp.status_code == 200
    assert resp.data["data"]["email"] == "target@test.com"
    assert "password" not in resp.data["data"]


@pytest.mark.django_db
def test_non_admin_cannot_retrieve_another_users_metadata():
    User.objects.create_user(email="target2@test.com", password="s3cret-pass", name="Target2")
    client_user = User.objects.create_user(email="plain@test.com", password="s3cret-pass", name="Plain")
    target = User.objects.get(email="target2@test.com")
    client = APIClient()
    client.force_authenticate(client_user)

    resp = client.get(f"/api/v1/admin/users/{target.id}/status")

    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Revocación de acceso: `status` debe cortar la autenticación de verdad
# (sección 13/40). Antes solo se escribía la columna y el usuario suspendido
# seguía entrando.
# ---------------------------------------------------------------------------


def _login(email, password):
    return APIClient().post(
        "/api/v1/auth/login", {"email": email, "password": password}, format="json"
    )


@pytest.mark.django_db
def test_status_suspended_deactivates_the_account_in_db():
    user = User.objects.create_user(email="susp@test.com", password="S3gura-pass-123", name="Susp")

    user.status = User.Status.SUSPENDED
    user.save(update_fields=["status"])

    row = User.objects.get(pk=user.pk)
    assert row.is_active is False


@pytest.mark.django_db
def test_reactivating_an_account_restores_is_active():
    user = User.objects.create_user(email="react@test.com", password="S3gura-pass-123", name="React")
    user.status = User.Status.SUSPENDED
    user.save(update_fields=["status"])

    user.status = User.Status.ACTIVE
    user.save(update_fields=["status"])

    assert User.objects.get(pk=user.pk).is_active is True


@pytest.mark.django_db
def test_suspended_user_cannot_log_in():
    User.objects.create_user(email="nologin@test.com", password="S3gura-pass-123", name="NoLogin")
    assert _login("nologin@test.com", "S3gura-pass-123").status_code == 200

    user = User.objects.get(email="nologin@test.com")
    user.status = User.Status.SUSPENDED
    user.save(update_fields=["status"])

    assert _login("nologin@test.com", "S3gura-pass-123").status_code == 401


@pytest.mark.django_db
def test_admin_suspension_revokes_existing_refresh_tokens():
    victim = User.objects.create_user(email="victim@test.com", password="S3gura-pass-123", name="Victim")
    admin = User.objects.create_user(
        email="root2@test.com", password="S3gura-pass-123", name="Root", role=User.Role.SUPER_ADMIN
    )
    refresh = _login("victim@test.com", "S3gura-pass-123").data["data"]["refresh"]

    admin_client = APIClient()
    admin_client.force_authenticate(admin)
    resp = admin_client.patch(f"/api/v1/admin/users/{victim.id}/status", {"status": "suspended"})
    assert resp.status_code == 200

    # El refresh token que ya tenía en la mano deja de servir.
    refreshed = APIClient().post("/api/v1/auth/refresh", {"refresh": refresh}, format="json")
    assert refreshed.status_code == 401


@pytest.mark.django_db
def test_changing_password_revokes_existing_refresh_tokens():
    User.objects.create_user(email="rotate@test.com", password="S3gura-pass-123", name="Rotate")
    refresh = _login("rotate@test.com", "S3gura-pass-123").data["data"]["refresh"]
    user = User.objects.get(email="rotate@test.com")

    client = APIClient()
    client.force_authenticate(user)
    resp = client.patch(
        "/api/v1/users/me/password",
        {"old_password": "S3gura-pass-123", "new_password": "Otra-clave-999"},
        format="json",
    )
    assert resp.status_code == 204

    refreshed = APIClient().post("/api/v1/auth/refresh", {"refresh": refresh}, format="json")
    assert refreshed.status_code == 401


@pytest.mark.django_db
def test_logout_with_an_invalid_token_returns_400_not_500():
    user = User.objects.create_user(email="logout@test.com", password="S3gura-pass-123", name="Logout")
    client = APIClient()
    client.force_authenticate(user)

    resp = client.post("/api/v1/auth/logout", {"refresh": "no-es-un-token"}, format="json")

    assert resp.status_code == 400
    assert resp.data["error"]["code"] == "BAD_REQUEST"


@pytest.mark.django_db
def test_admin_cannot_suspend_their_own_account():
    admin = User.objects.create_user(
        email="self@test.com", password="S3gura-pass-123", name="Self", role=User.Role.SUPER_ADMIN
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.patch(f"/api/v1/admin/users/{admin.id}/status", {"status": "suspended"})

    assert resp.status_code == 403
    assert User.objects.get(pk=admin.pk).status == User.Status.ACTIVE


@pytest.mark.django_db
def test_non_super_admin_cannot_suspend_another_admin():
    museum_admin = User.objects.create_user(
        email="museo@test.com", password="S3gura-pass-123", name="Museo", role=User.Role.ADMIN_MUSEUM
    )
    super_admin = User.objects.create_user(
        email="super@test.com", password="S3gura-pass-123", name="Super", role=User.Role.SUPER_ADMIN
    )
    client = APIClient()
    client.force_authenticate(museum_admin)

    resp = client.patch(f"/api/v1/admin/users/{super_admin.id}/status", {"status": "suspended"})

    assert resp.status_code == 403
    assert User.objects.get(pk=super_admin.pk).is_active is True


@pytest.mark.django_db
def test_login_is_rate_limited(enable_throttling):
    enable_throttling({"auth": "3/min"})
    User.objects.create_user(email="brute@test.com", password="S3gura-pass-123", name="Brute")
    client = APIClient()

    codes = [
        client.post(
            "/api/v1/auth/login", {"email": "brute@test.com", "password": "mala"}, format="json"
        ).status_code
        for _ in range(5)
    ]

    assert 429 in codes


# ---------------------------------------------------------------------------
# Django Admin: con un ModelAdmin plano el formulario exponía `password` como
# texto libre y dejaba `is_superuser`/`role` editables por cualquier staff,
# que podía auto-promoverse. Ver apps/identity/admin.py.
# ---------------------------------------------------------------------------


@pytest.fixture
def admin_form_for():
    """Devuelve el formulario del admin tal como lo vería `request.user`."""

    from django.contrib import admin as django_admin
    from django.test import RequestFactory

    def _build(acting_user, target=None):
        model_admin = django_admin.site._registry[User]
        request = RequestFactory().get("/admin/identity/user/")
        request.user = acting_user
        return model_admin.get_form(request, target)(instance=target)

    return _build


@pytest.mark.django_db
def test_admin_form_never_exposes_the_raw_password_hash(admin_form_for):
    from django.contrib.auth.forms import ReadOnlyPasswordHashField

    root = User.objects.create_superuser(email="r1@test.com", password="S3gura-pass-123", name="R")
    form = admin_form_for(root, root)

    assert isinstance(form.fields["password"], ReadOnlyPasswordHashField)
    assert form.fields["password"].disabled is True


@pytest.mark.django_db
def test_privilege_fields_are_readonly_for_a_non_superuser(admin_form_for):
    staff = User.objects.create_user(
        email="staff1@test.com", password="S3gura-pass-123", name="Staff",
        role=User.Role.ADMIN_MUSEUM, is_staff=True,
    )
    form = admin_form_for(staff, staff)

    for field in ("role", "is_staff", "is_superuser", "groups", "user_permissions"):
        assert field not in form.fields, f"{field} no debería ser editable por un no-superusuario"
    # ...pero los campos de perfil sí siguen siendo editables.
    assert "name" in form.fields
    assert "status" in form.fields


@pytest.mark.django_db
def test_superuser_keeps_the_privilege_fields_editable(admin_form_for):
    root = User.objects.create_superuser(email="r2@test.com", password="S3gura-pass-123", name="R")
    form = admin_form_for(root, root)

    for field in ("role", "is_staff", "is_superuser", "groups", "user_permissions"):
        assert field in form.fields


@pytest.mark.django_db
def test_is_active_is_never_editable_in_the_admin(admin_form_for):
    root = User.objects.create_superuser(email="r3@test.com", password="S3gura-pass-123", name="R")

    assert "is_active" not in admin_form_for(root, root).fields


@pytest.mark.django_db
def test_staff_cannot_escalate_themselves_to_superuser_through_the_admin(client):
    from django.contrib.auth.models import Permission

    staff = User.objects.create_user(
        email="staff2@test.com", password="S3gura-pass-123", name="Staff",
        role=User.Role.ADMIN_MUSEUM, is_staff=True,
    )
    staff.user_permissions.add(Permission.objects.get(codename="change_user"))
    client.force_login(staff)

    resp = client.post(
        f"/admin/identity/user/{staff.id}/change/",
        {
            "email": "staff2@test.com",
            "name": "Staff",
            "phone": "",
            "city": "",
            "bio": "",
            "status": User.Status.ACTIVE,
            "organization_scope": "",
            # El intento de escalada:
            "role": User.Role.SUPER_ADMIN,
            "is_staff": "on",
            "is_superuser": "on",
        },
    )

    # 302 = el formulario fue válido y se guardó: los campos de privilegio
    # simplemente no formaban parte de él.
    assert resp.status_code == 302
    staff.refresh_from_db()
    assert staff.is_superuser is False
    assert staff.role == User.Role.ADMIN_MUSEUM


@pytest.mark.django_db
def test_superuser_can_create_a_user_from_the_admin(client):
    root = User.objects.create_superuser(email="r4@test.com", password="S3gura-pass-123", name="R")
    client.force_login(root)

    resp = client.post(
        "/admin/identity/user/add/",
        {
            "email": "nuevo-admin@test.com",
            "name": "Nuevo",
            "usable_password": "true",
            "password1": "S3gura-pass-123",
            "password2": "S3gura-pass-123",
        },
    )

    assert resp.status_code == 302, getattr(resp, "context_data", {}).get("adminform")
    creado = User.objects.get(email="nuevo-admin@test.com")
    assert creado.check_password("S3gura-pass-123")
    assert creado.role == User.Role.CLIENT
    assert creado.is_superuser is False


@pytest.mark.django_db
def test_admin_password_change_view_still_works(client):
    root = User.objects.create_superuser(email="r5@test.com", password="S3gura-pass-123", name="R")
    target = User.objects.create_user(email="pwd@test.com", password="S3gura-pass-123", name="P")
    client.force_login(root)

    resp = client.post(
        f"/admin/identity/user/{target.id}/password/",
        {"password1": "Nueva-clave-456", "password2": "Nueva-clave-456"},
    )

    assert resp.status_code == 302
    target.refresh_from_db()
    assert target.check_password("Nueva-clave-456")


# ---------------------------------------------------------------------------
# #25: el email es una sola identidad sin importar mayúsculas — tanto para
# crear la cuenta como para iniciar sesión con ella.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_login_is_case_insensitive_on_the_email():
    User.objects.create_user(email="mixed@test.com", password="S3gura-pass-123", name="Mixed")

    resp = _login("Mixed@Test.com", "S3gura-pass-123")

    assert resp.status_code == 200


@pytest.mark.django_db
def test_register_rejects_an_email_that_only_differs_in_case():
    User.objects.create_user(email="dup2@test.com", password="S3gura-pass-123", name="Existing")
    client = APIClient()

    resp = client.post(
        "/api/v1/auth/register",
        {"email": "Dup2@Test.com", "password": "S3gura-pass-123", "name": "Nuevo"},
        format="json",
    )

    assert resp.status_code == 400
    assert User.objects.filter(email="dup2@test.com").count() == 1


@pytest.mark.django_db
def test_admin_direct_save_also_lowercases_the_email():
    # No solo create_user(): cualquier vía que llame a save() (Django Admin,
    # un fixture, `createsuperuser`) normaliza igual.
    user = User(email="Directo@Test.com", name="Directo")
    user.set_password("S3gura-pass-123")
    user.save()

    assert User.objects.get(pk=user.pk).email == "directo@test.com"
