"""Split 14 — Reports (sección 25).

"Arquitectura inicial": PostgreSQL -> Django ORM -> Selectors -> Report API,
sin tablas propias. Reports es nivel 6 (sección 50) y puede leer las tablas
de cualquier dominio inferior (Commerce, Learning, Donations, Courses)
directamente sin romper la jerarquía de importación — la restricción de esa
sección solo corre en la dirección contraria (un inferior no puede leer un
superior). Si el volumen lo justifica, la "Evolución" de la sección 25
introduce read models/vistas materializadas; no hace falta todavía.
"""

from decimal import Decimal

from django.db.models import Count, Q, Sum

from apps.commerce.models import Order, OrderItem
from apps.courses.models import Course
from apps.donations.models import Donation
from apps.learning.models import Enrollment


def summary():
    paid_orders = Order.objects.filter(payment_status=Order.PaymentStatus.PAID)
    approved_donations = Donation.objects.filter(status=Donation.Status.APPROVED)
    return {
        "orders": {
            "count_paid": paid_orders.count(),
            "total_paid": paid_orders.aggregate(total=Sum("total"))["total"] or Decimal(0),
        },
        "donations": {
            "count_approved": approved_donations.count(),
            "total_approved": approved_donations.aggregate(total=Sum("amount"))["total"] or Decimal(0),
        },
        "enrollments": {"total": Enrollment.objects.count()},
        "courses": {"published": Course.objects.filter(status=Course.Status.PUBLISHED).count()},
    }


def transactions():
    return Order.objects.filter(payment_status=Order.PaymentStatus.PAID).order_by("-created_at")


def course_revenue():
    return (
        OrderItem.objects.filter(order__payment_status=Order.PaymentStatus.PAID)
        .values("course_id", "course__title", "course__slug")
        .annotate(revenue=Sum("price_snapshot"), sales=Count("id"))
        .order_by("-revenue")
    )


def enrollment_stats():
    return (
        Enrollment.objects.values("course_id", "course__title")
        .annotate(
            total=Count("id"),
            completed=Count("id", filter=Q(status=Enrollment.Status.COMPLETED)),
        )
        .order_by("-total")
    )


def donation_stats():
    return (
        Donation.objects.filter(status=Donation.Status.APPROVED)
        .values("organization_target")
        .annotate(total=Sum("amount"), count=Count("id"))
        .order_by("-total")
    )
