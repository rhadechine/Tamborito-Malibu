"""Alcance organizacional (sección 39): role + organization_scope.

Estos tests cruzan varios dominios a propósito — la regla es transversal, no
de una app concreta.
"""

import pytest
from rest_framework.test import APIClient

from apps.content.models import Page
from apps.courses.models import Course, CourseModule
from apps.identity.models import User
from apps.library.models import LibraryResource
from apps.museum.models import MuseumPiece
from common.scopes import allowed_organizations, effective_scope, scope_covers


@pytest.fixture
def foundation_admin():
    return User.objects.create_user(
        email="fund@test.com", password="Testpass123", name="F", role=User.Role.ADMIN_FOUNDATION
    )


@pytest.fixture
def museum_admin():
    return User.objects.create_user(
        email="mus@test.com", password="Testpass123", name="M", role=User.Role.ADMIN_MUSEUM
    )


@pytest.fixture
def super_admin():
    return User.objects.create_user(
        email="root@test.com", password="Testpass123", name="R", role=User.Role.SUPER_ADMIN
    )


def _client(user):
    client = APIClient()
    client.force_authenticate(user)
    return client


# --- Reglas de alcance ---------------------------------------------------


@pytest.mark.django_db
def test_scope_is_derived_from_the_role_when_not_set_explicitly(foundation_admin, museum_admin, super_admin):
    assert effective_scope(foundation_admin) == "foundation"
    assert effective_scope(museum_admin) == "museum"
    assert effective_scope(super_admin) == "both"


@pytest.mark.django_db
def test_explicit_scope_overrides_the_role_default(foundation_admin):
    foundation_admin.organization_scope = User.OrganizationScope.MUSEUM
    foundation_admin.save(update_fields=["organization_scope"])

    assert effective_scope(foundation_admin) == "museum"
    assert scope_covers(foundation_admin, "museum") is True
    assert scope_covers(foundation_admin, "foundation") is False


@pytest.mark.django_db
def test_each_scope_reaches_its_own_organization_and_the_shared_one(foundation_admin, museum_admin):
    assert allowed_organizations(foundation_admin) == frozenset({"foundation", "both"})
    assert allowed_organizations(museum_admin) == frozenset({"museum", "both"})


@pytest.mark.django_db
def test_an_object_without_organization_needs_full_reach(foundation_admin, super_admin):
    assert scope_covers(foundation_admin, "") is False
    assert scope_covers(super_admin, "") is True


@pytest.mark.django_db
def test_a_plain_client_reaches_nothing():
    user = User.objects.create_user(email="c@test.com", password="Testpass123", name="C")
    assert allowed_organizations(user) == frozenset()


# --- Courses -------------------------------------------------------------


@pytest.mark.django_db
def test_museum_admin_cannot_create_a_foundation_course(museum_admin):
    resp = _client(museum_admin).post(
        "/api/v1/admin/courses",
        {"slug": "curso-fund", "title": "F", "organization": "foundation", "price": "0.00"},
    )

    assert resp.status_code == 403
    assert not Course.objects.filter(slug="curso-fund").exists()


@pytest.mark.django_db
def test_museum_admin_cannot_edit_publish_or_delete_a_foundation_course(museum_admin):
    course = Course.objects.create(slug="solo-fund", title="F", organization="foundation")
    client = _client(museum_admin)

    assert client.get(f"/api/v1/admin/courses/{course.id}").status_code == 403
    assert client.patch(f"/api/v1/admin/courses/{course.id}", {"title": "Hackeado"}).status_code == 403
    assert client.post(f"/api/v1/admin/courses/{course.id}/publish").status_code == 403
    assert client.post(f"/api/v1/admin/courses/{course.id}/archive").status_code == 403
    assert client.delete(f"/api/v1/admin/courses/{course.id}").status_code == 403

    course.refresh_from_db()
    assert course.title == "F"
    assert course.status == Course.Status.DRAFT


@pytest.mark.django_db
def test_admin_course_list_only_shows_courses_in_scope(museum_admin):
    Course.objects.create(slug="de-museo", title="M", organization="museum")
    Course.objects.create(slug="de-fundacion", title="F", organization="foundation")
    Course.objects.create(slug="compartido", title="B", organization="both")

    resp = _client(museum_admin).get("/api/v1/admin/courses")

    slugs = {c["slug"] for c in resp.data["data"]}
    assert slugs == {"de-museo", "compartido"}


@pytest.mark.django_db
def test_a_course_cannot_be_moved_out_of_scope_with_a_patch(museum_admin):
    course = Course.objects.create(slug="mio", title="M", organization="museum")

    resp = _client(museum_admin).patch(
        f"/api/v1/admin/courses/{course.id}", {"organization": "foundation"}
    )

    assert resp.status_code == 403
    course.refresh_from_db()
    assert course.organization == "museum"


@pytest.mark.django_db
def test_shared_content_is_editable_by_both_organizations(foundation_admin, museum_admin):
    course = Course.objects.create(slug="ambos", title="B", organization="both")

    assert _client(foundation_admin).patch(
        f"/api/v1/admin/courses/{course.id}", {"title": "Desde Fundación"}
    ).status_code == 200
    assert _client(museum_admin).patch(
        f"/api/v1/admin/courses/{course.id}", {"title": "Desde Museo"}
    ).status_code == 200


@pytest.mark.django_db
def test_modules_and_lessons_inherit_the_scope_of_their_course(museum_admin):
    course = Course.objects.create(slug="fund-mod", title="F", organization="foundation")
    module = CourseModule.objects.create(course=course, title="M1")
    client = _client(museum_admin)

    assert client.post(f"/api/v1/admin/courses/{course.id}/modules", {"title": "Nuevo"}).status_code == 403
    assert client.patch(f"/api/v1/admin/modules/{module.id}", {"title": "Hackeado"}).status_code == 403
    assert client.post(f"/api/v1/admin/modules/{module.id}/lessons",
                       {"title": "L", "type": "reading"}).status_code == 403

    module.refresh_from_db()
    assert module.title == "M1"


@pytest.mark.django_db
def test_creating_a_module_under_a_missing_course_is_404_not_500(super_admin):
    resp = _client(super_admin).post("/api/v1/admin/courses/999999/modules", {"title": "X"})

    assert resp.status_code == 404


# --- Library / Content / Museum -----------------------------------------


@pytest.mark.django_db
def test_museum_admin_cannot_touch_a_foundation_library_resource(museum_admin):
    resource = LibraryResource.objects.create(
        title="Doc", slug="doc-fund", type="document", organization="foundation"
    )
    client = _client(museum_admin)

    assert client.patch(f"/api/v1/admin/library/resources/{resource.id}", {"title": "X"}).status_code == 403
    assert client.post(
        "/api/v1/admin/library/resources",
        {"title": "N", "slug": "n", "type": "document", "organization": "foundation"},
    ).status_code == 403

    listed = client.get("/api/v1/admin/library/resources").data["data"]
    assert resource.slug not in {r["slug"] for r in listed}


@pytest.mark.django_db
def test_museum_admin_cannot_touch_a_foundation_page(museum_admin):
    page = Page.objects.create(slug="pag-fund", organization="foundation", title="P")
    client = _client(museum_admin)

    assert client.patch(f"/api/v1/admin/pages/{page.id}", {"title": "X"}).status_code == 403
    assert client.post(f"/api/v1/admin/pages/{page.id}/sections", {"type": "hero"}).status_code == 403

    listed = client.get("/api/v1/admin/pages").data["data"]
    assert page.slug not in {p["slug"] for p in listed}


@pytest.mark.django_db
def test_foundation_admin_cannot_administer_museum_pieces(foundation_admin):
    piece = MuseumPiece.objects.create(name="P1", slug="p1-fund")
    client = _client(foundation_admin)

    assert client.post("/api/v1/admin/museum/pieces", {"name": "N", "slug": "n"}).status_code == 403
    assert client.patch(f"/api/v1/admin/museum/pieces/{piece.id}", {"status": "published"}).status_code == 403
    assert client.delete(f"/api/v1/admin/museum/pieces/{piece.id}").status_code == 403

    piece.refresh_from_db()
    assert piece.status != "published"


@pytest.mark.django_db
def test_super_admin_reaches_everything(super_admin):
    course = Course.objects.create(slug="c-super", title="C", organization="foundation")
    piece = MuseumPiece.objects.create(name="P", slug="p-super")
    client = _client(super_admin)

    assert client.patch(f"/api/v1/admin/courses/{course.id}", {"title": "OK"}).status_code == 200
    assert client.patch(f"/api/v1/admin/museum/pieces/{piece.id}", {"status": "published"}).status_code == 200


# --- Frontera financiera: solo el super_admin -----------------------------
#
# Métricas, órdenes, donaciones y pagos son del ecosistema completo y no se
# pueden acotar por `organization_scope` (una orden puede mezclar cursos de
# las dos organizaciones). Los administra el super_admin, que es el
# administrador general de Fundación + Museo.

FINANCIAL_READ_ENDPOINTS = [
    "/api/v1/admin/reports/summary",
    "/api/v1/admin/reports/transactions",
    "/api/v1/admin/reports/course-revenue",
    "/api/v1/admin/reports/enrollments",
    "/api/v1/admin/reports/donations",
    "/api/v1/admin/orders",
    "/api/v1/admin/donations",
]


@pytest.mark.django_db
@pytest.mark.parametrize("endpoint", FINANCIAL_READ_ENDPOINTS)
def test_an_organization_admin_cannot_read_financial_data(foundation_admin, museum_admin, endpoint):
    assert _client(foundation_admin).get(endpoint).status_code == 403
    assert _client(museum_admin).get(endpoint).status_code == 403


@pytest.mark.django_db
@pytest.mark.parametrize("endpoint", FINANCIAL_READ_ENDPOINTS)
def test_the_super_admin_reads_financial_data(super_admin, endpoint):
    assert _client(super_admin).get(endpoint).status_code == 200


@pytest.mark.django_db
def test_an_organization_admin_cannot_manage_orders_or_donations(museum_admin):
    from apps.commerce.models import Order
    from apps.donations.models import Donation

    buyer = User.objects.create_user(email="comprador@test.com", password="Testpass123", name="C")
    order = Order.objects.create(user=buyer, subtotal="100.00", total="100.00")
    donation = Donation.objects.create(
        donor_name="Ana", donor_email="ana@example.com", organization_target="museum", amount="50000.00"
    )
    client = _client(museum_admin)

    assert client.get(f"/api/v1/admin/orders/{order.id}").status_code == 403
    assert client.patch(f"/api/v1/admin/orders/{order.id}", {"payment_status": "paid"}).status_code == 403
    assert client.patch(f"/api/v1/admin/donations/{donation.id}", {"status": "approved"}).status_code == 403

    order.refresh_from_db()
    donation.refresh_from_db()
    assert order.payment_status == Order.PaymentStatus.PENDING
    assert donation.status == Donation.Status.PENDING


@pytest.mark.django_db
def test_an_organization_admin_cannot_refund_or_inspect_a_payment(museum_admin):
    from apps.commerce.models import Order
    from apps.payments.models import PaymentIntent

    buyer = User.objects.create_user(email="comprador2@test.com", password="Testpass123", name="C")
    order = Order.objects.create(user=buyer, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=buyer, amount="100.00")
    client = _client(museum_admin)

    assert client.post(f"/api/v1/admin/payments/intents/{intent.id}/refund").status_code == 403
    # Tampoco ve el intent de otro usuario: para él, no existe.
    assert client.get(f"/api/v1/payments/intents/{intent.id}").status_code == 404


@pytest.mark.django_db
def test_the_super_admin_can_inspect_any_payment_intent(super_admin):
    from apps.commerce.models import Order
    from apps.payments.models import PaymentIntent

    buyer = User.objects.create_user(email="comprador3@test.com", password="Testpass123", name="C")
    order = Order.objects.create(user=buyer, subtotal="100.00", total="100.00")
    intent = PaymentIntent.objects.create(order=order, user=buyer, amount="100.00")

    assert _client(super_admin).get(f"/api/v1/payments/intents/{intent.id}").status_code == 200


@pytest.mark.django_db
def test_organization_admins_keep_their_content_responsibilities(foundation_admin, museum_admin):
    # La restricción financiera no debe haberles quitado lo suyo.
    assert _client(foundation_admin).post(
        "/api/v1/admin/courses",
        {"slug": "curso-f", "title": "F", "organization": "foundation", "price": "0.00"},
    ).status_code == 201
    assert _client(museum_admin).post(
        "/api/v1/admin/museum/pieces", {"name": "Pieza", "slug": "pieza-ok"}
    ).status_code == 201


# --- Inscripciones y evidencias: acotadas por la organización del curso ---


@pytest.fixture
def foundation_enrollment():
    from apps.learning.models import Enrollment

    student = User.objects.create_user(email="alum@test.com", password="Testpass123", name="A")
    course = Course.objects.create(
        slug="curso-de-fundacion", title="F", organization="foundation", price="0.00",
        status=Course.Status.PUBLISHED,
    )
    enrollment = Enrollment.objects.create(
        user=student, course=course, source=Enrollment.Source.ADMIN
    )
    return student, course, enrollment


@pytest.mark.django_db
def test_museum_admin_does_not_see_foundation_enrollments(museum_admin, foundation_enrollment):
    student, _course, _enrollment = foundation_enrollment
    Course.objects.create(slug="curso-de-museo", title="M", organization="museum", price="0.00")
    client = _client(museum_admin)

    listed = client.get("/api/v1/admin/enrollments").data["data"]
    assert listed == []

    per_student = client.get(f"/api/v1/admin/students/{student.id}/enrollments").data["data"]
    assert per_student == []


@pytest.mark.django_db
def test_museum_admin_cannot_read_or_grade_a_foundation_enrollment(museum_admin, foundation_enrollment):
    _student, _course, enrollment = foundation_enrollment
    client = _client(museum_admin)

    assert client.get(f"/api/v1/admin/enrollments/{enrollment.id}").status_code == 403
    assert client.patch(
        f"/api/v1/admin/enrollments/{enrollment.id}", {"grade": "5.00"}
    ).status_code == 403

    enrollment.refresh_from_db()
    assert enrollment.grade is None


@pytest.mark.django_db
def test_museum_admin_cannot_manually_enroll_into_a_foundation_course(museum_admin, foundation_enrollment):
    from apps.learning.models import Enrollment

    _student, course, _enrollment = foundation_enrollment
    otro = User.objects.create_user(email="otro-alum@test.com", password="Testpass123", name="O")

    resp = _client(museum_admin).post(
        "/api/v1/admin/enrollments", {"user_id": otro.id, "course_id": course.id}
    )

    assert resp.status_code == 403
    assert not Enrollment.objects.filter(user=otro, course=course).exists()


@pytest.mark.django_db
def test_museum_admin_cannot_see_or_review_foundation_evidence(museum_admin, foundation_enrollment):
    from apps.courses.models import CourseModule, Lesson
    from apps.learning.models import Evidence

    _student, course, enrollment = foundation_enrollment
    module = CourseModule.objects.create(course=course, title="M1")
    lesson = Lesson.objects.create(module=module, title="L1", type="assignment", upload_enabled=True)
    evidence = Evidence.objects.create(enrollment=enrollment, lesson=lesson, description="tarea")
    client = _client(museum_admin)

    assert client.get("/api/v1/admin/evidences").data["data"] == []
    assert client.get(f"/api/v1/admin/evidences/{evidence.id}").status_code == 403
    assert client.patch(
        f"/api/v1/admin/evidences/{evidence.id}/review", {"status": "approved"}
    ).status_code == 403

    evidence.refresh_from_db()
    assert evidence.status == Evidence.Status.PENDING


@pytest.mark.django_db
def test_foundation_admin_grades_its_own_enrollment(foundation_admin, foundation_enrollment):
    _student, _course, enrollment = foundation_enrollment

    resp = _client(foundation_admin).patch(
        f"/api/v1/admin/enrollments/{enrollment.id}", {"grade": "4.50"}
    )

    assert resp.status_code == 200
    enrollment.refresh_from_db()
    assert str(enrollment.grade) == "4.50"


# --- Certificados: cuelgan de la organización de su curso ----------------


@pytest.mark.django_db
def test_museum_admin_cannot_revoke_a_foundation_certificate(museum_admin, foundation_enrollment):
    from apps.certificates.models import Certificate

    student, course, _enrollment = foundation_enrollment
    certificate = Certificate.objects.create(user=student, course=course)

    resp = _client(museum_admin).post(f"/api/v1/admin/certificates/{certificate.id}/revoke")

    assert resp.status_code == 403
    certificate.refresh_from_db()
    assert certificate.revoked_at is None


@pytest.mark.django_db
def test_foundation_admin_revokes_its_own_certificate(foundation_admin, foundation_enrollment):
    from apps.certificates.models import Certificate

    student, course, _enrollment = foundation_enrollment
    certificate = Certificate.objects.create(user=student, course=course)

    resp = _client(foundation_admin).post(f"/api/v1/admin/certificates/{certificate.id}/revoke")

    assert resp.status_code == 200
    certificate.refresh_from_db()
    assert certificate.revoked_at is not None


# --- Settings: configuración global del ecosistema -----------------------


@pytest.mark.django_db
def test_only_the_super_admin_manages_platform_settings(foundation_admin, museum_admin, super_admin):
    from apps.settings.models import PlatformSettings

    for admin in (foundation_admin, museum_admin):
        client = _client(admin)
        assert client.get("/api/v1/admin/settings").status_code == 403
        assert client.patch("/api/v1/admin/settings", {"maintenance_mode": True}).status_code == 403

    assert PlatformSettings.objects.load().maintenance_mode is False

    client = _client(super_admin)
    assert client.get("/api/v1/admin/settings").status_code == 200
    assert client.patch("/api/v1/admin/settings", {"maintenance_mode": True}).status_code == 200
    assert PlatformSettings.objects.load().maintenance_mode is True
