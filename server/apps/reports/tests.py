from decimal import Decimal

import pytest
from rest_framework.test import APIClient

from apps.commerce.models import Order, OrderItem
from apps.courses.models import Course
from apps.donations.models import Donation
from apps.identity.models import User
from apps.learning.models import Enrollment


@pytest.fixture
def admin():
    return User.objects.create_user(
        email="a@a.com", password="Testpass123", name="A", role=User.Role.SUPER_ADMIN
    )


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.mark.django_db
def test_summary_only_counts_paid_orders_and_approved_donations(admin, student):
    course = Course.objects.create(slug="c1", title="C1", organization="museum", price="100.00")
    paid = Order.objects.create(user=student, subtotal="100.00", total="100.00", payment_status=Order.PaymentStatus.PAID)
    Order.objects.create(user=student, subtotal="50.00", total="50.00")  # pendiente, no cuenta
    Donation.objects.create(
        donor_name="D", donor_email="d@d.com", organization_target="museum",
        amount="200.00", status=Donation.Status.APPROVED,
    )
    Donation.objects.create(
        donor_name="D2", donor_email="d2@d.com", organization_target="museum",
        amount="999.00", status=Donation.Status.PENDING,
    )
    Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get("/api/v1/admin/reports/summary")

    data = resp.data["data"]
    assert data["orders"]["count_paid"] == 1
    assert data["orders"]["total_paid"] == Decimal("100.00")
    assert data["donations"]["count_approved"] == 1
    assert data["donations"]["total_approved"] == Decimal("200.00")
    assert data["enrollments"]["total"] == 1
    assert paid.payment_status == Order.PaymentStatus.PAID


@pytest.mark.django_db
def test_transactions_lists_only_paid_orders(admin, student):
    Order.objects.create(user=student, subtotal="10.00", total="10.00", payment_status=Order.PaymentStatus.PAID)
    Order.objects.create(user=student, subtotal="20.00", total="20.00")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get("/api/v1/admin/reports/transactions")

    assert len(resp.data["data"]) == 1
    assert resp.data["data"][0]["total"] == "10.00"


@pytest.mark.django_db
def test_course_revenue_groups_by_course(admin, student):
    course = Course.objects.create(slug="c2", title="C2", organization="museum", price="100.00")
    order1 = Order.objects.create(user=student, subtotal="100.00", total="100.00", payment_status=Order.PaymentStatus.PAID)
    order2 = Order.objects.create(user=student, subtotal="100.00", total="100.00", payment_status=Order.PaymentStatus.PAID)
    OrderItem.objects.create(order=order1, course=course, title_snapshot="C2", price_snapshot="100.00")
    OrderItem.objects.create(order=order2, course=course, title_snapshot="C2", price_snapshot="100.00")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get("/api/v1/admin/reports/course-revenue")

    row = resp.data["data"][0]
    assert row["course__title"] == "C2"
    # DecimalField serializa a string (misma convención que el resto de la API,
    # p. ej. OrderSerializer.total): estos reportes ahora pasan por un
    # serializer real en vez de devolver Decimal crudo directo a la Response.
    assert row["revenue"] == "200.00"
    assert row["sales"] == 2


@pytest.mark.django_db
def test_enrollment_stats_counts_completed_per_course(admin, student):
    course = Course.objects.create(slug="c3", title="C3", organization="museum", is_free=True)
    Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE, status=Enrollment.Status.COMPLETED)
    other = User.objects.create_user(email="o@o.com", password="Testpass123", name="O")
    Enrollment.objects.create(user=other, course=course, source=Enrollment.Source.FREE)
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get("/api/v1/admin/reports/enrollments")

    row = resp.data["data"][0]
    assert row["course__title"] == "C3"
    assert row["total"] == 2
    assert row["completed"] == 1


@pytest.mark.django_db
def test_donation_stats_groups_by_organization_target(admin):
    Donation.objects.create(
        donor_name="D", donor_email="d@d.com", organization_target="museum",
        amount="100.00", status=Donation.Status.APPROVED,
    )
    Donation.objects.create(
        donor_name="D2", donor_email="d2@d.com", organization_target="foundation",
        amount="50.00", status=Donation.Status.APPROVED,
    )
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get("/api/v1/admin/reports/donations")

    targets = {row["organization_target"]: row["total"] for row in resp.data["data"]}
    assert targets == {"museum": "100.00", "foundation": "50.00"}


@pytest.mark.django_db
def test_student_cannot_access_reports(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get("/api/v1/admin/reports/summary")

    assert resp.status_code == 403


# ---------------------------------------------------------------------------
# #26: los reportes de agregación ya no devuelven la tabla completa de una
# sola vez — usan la misma paginación que el resto de la API. `donation_stats`
# agrupa por `organization_target` (solo 3 valores posibles), así que la
# paginación se ejercita con `course_revenue`/`enrollment_stats`, que agrupan
# por curso y sí admiten tantos grupos como cursos se creen.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_course_revenue_report_is_paginated(admin, student):
    for i in range(25):
        course = Course.objects.create(slug=f"rev-{i}", title=f"R{i}", organization="museum", price="10.00")
        order = Order.objects.create(user=student, subtotal="10.00", total="10.00", payment_status=Order.PaymentStatus.PAID)
        OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="10.00")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get("/api/v1/admin/reports/course-revenue")

    assert resp.status_code == 200
    assert resp.data["meta"]["count"] == 25
    assert len(resp.data["data"]) == 20  # page_size por defecto


@pytest.mark.django_db
def test_enrollment_stats_report_second_page_is_reachable(admin, student):
    for i in range(21):
        course = Course.objects.create(
            slug=f"enr-{i}", title=f"E{i}", organization="museum", price="0.00",
            status=Course.Status.PUBLISHED,
        )
        Enrollment.objects.create(user=student, course=course, source=Enrollment.Source.FREE)
    client = APIClient()
    client.force_authenticate(admin)

    first_page = client.get("/api/v1/admin/reports/enrollments")
    second_page = client.get("/api/v1/admin/reports/enrollments?page=2")

    assert first_page.data["meta"]["count"] == 21
    assert len(first_page.data["data"]) == 20
    assert len(second_page.data["data"]) == 1
