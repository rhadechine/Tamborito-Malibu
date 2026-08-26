from decimal import Decimal

import pytest
from django.db import IntegrityError, transaction
from rest_framework.test import APIClient

from apps.commerce.models import Cart, Order
from apps.courses.models import Course
from apps.identity.models import User


@pytest.fixture
def student():
    return User.objects.create_user(email="s@s.com", password="Testpass123", name="S")


@pytest.mark.django_db
def test_checkout_freezes_price_snapshot_even_if_course_price_changes_later(student):
    course = Course.objects.create(
        slug="c1", title="C1", organization="museum", price="100.00",
        status=Course.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)

    client.post("/api/v1/cart/items", {"course_id": course.id})
    resp = client.post("/api/v1/orders/checkout")

    assert resp.status_code == 201
    assert resp.data["data"]["total"] == "100.00"

    # el precio del curso sube después de la compra: la orden no debe cambiar
    course.price = "150.00"
    course.save(update_fields=["price"])

    order = Order.objects.get(user=student)
    assert order.items.first().price_snapshot == Decimal("100.00")


@pytest.mark.django_db
def test_checkout_empties_cart_and_starts_a_new_active_one(student):
    course = Course.objects.create(
        slug="c2", title="C2", organization="museum", price="50.00",
        status=Course.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)

    client.post("/api/v1/cart/items", {"course_id": course.id})
    client.post("/api/v1/orders/checkout")

    new_cart = Cart.objects.active_for(student)
    assert new_cart.items.count() == 0
    assert Cart.objects.filter(user=student).count() == 2  # checked_out + nuevo active


@pytest.mark.django_db
def test_checkout_with_empty_cart_returns_400(student):
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/orders/checkout")

    assert resp.status_code == 400


@pytest.mark.django_db
def test_student_cannot_see_other_students_order(student):
    other = User.objects.create_user(email="o@o.com", password="Testpass123", name="O")
    order = Order.objects.create(user=other, subtotal="10.00", total="10.00")
    client = APIClient()
    client.force_authenticate(student)

    resp = client.get(f"/api/v1/student/orders/{order.id}")

    assert resp.status_code == 404


# ---------------------------------------------------------------------------
# #22: un solo carrito activo por usuario, garantizado a nivel de base de
# datos — antes `Cart.objects.active_for` tenía una carrera real.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_only_one_active_cart_can_exist_per_user_at_the_db_level(student):
    Cart.objects.create(user=student, status=Cart.Status.ACTIVE)

    with pytest.raises(IntegrityError), transaction.atomic():
        Cart.objects.create(user=student, status=Cart.Status.ACTIVE)


@pytest.mark.django_db
def test_a_checked_out_cart_does_not_block_a_new_active_one(student):
    Cart.objects.create(user=student, status=Cart.Status.CHECKED_OUT)

    # No debe reventar: el índice único es parcial (solo sobre status=active).
    Cart.objects.create(user=student, status=Cart.Status.ACTIVE)

    assert Cart.objects.filter(user=student, status=Cart.Status.ACTIVE).count() == 1


@pytest.mark.django_db
def test_concurrent_active_for_calls_do_not_crash_thanks_to_the_constraint(student):
    # `get_or_create` de Django reintenta el `get()` cuando el `create()`
    # choca contra un IntegrityError; con el constraint en su lugar, dos
    # llamadas "simultáneas" (aquí simuladas en secuencia) convergen al mismo
    # carrito en vez de que la segunda intente crear un duplicado.
    first = Cart.objects.active_for(student)
    second = Cart.objects.active_for(student)

    assert first.id == second.id
    assert Cart.objects.filter(user=student, status=Cart.Status.ACTIVE).count() == 1


# ---------------------------------------------------------------------------
# #23: el carrito y el checkout ya no aceptan lo que no debería poder
# comprarse — cursos no publicados, cursos gratuitos, o un curso al que el
# estudiante ya tiene acceso.
# ---------------------------------------------------------------------------


@pytest.mark.django_db
def test_cannot_add_an_unpublished_course_to_the_cart(student):
    course = Course.objects.create(slug="borrador", title="B", organization="museum", price="10.00")
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/cart/items", {"course_id": course.id})

    assert resp.status_code == 404


@pytest.mark.django_db
def test_cannot_add_a_free_course_to_the_cart(student):
    course = Course.objects.create(
        slug="gratis", title="G", organization="museum", price="0.00", status=Course.Status.PUBLISHED
    )
    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/cart/items", {"course_id": course.id})

    assert resp.status_code == 400
    assert Cart.objects.active_for(student).items.count() == 0


@pytest.mark.django_db
def test_cannot_add_a_course_the_student_is_already_enrolled_in(student):
    from apps.learning import services as learning_services

    free_course = Course.objects.create(
        slug="ya-tengo", title="YT", organization="museum", price="0.00", status=Course.Status.PUBLISHED
    )
    # Se inscribe gratis y luego el curso sube de precio (caso legítimo, no
    # debería poder "comprarse" después).
    learning_services.enroll_free(student, free_course)
    free_course.price = "80.00"
    free_course.save(update_fields=["price"])

    client = APIClient()
    client.force_authenticate(student)

    resp = client.post("/api/v1/cart/items", {"course_id": free_course.id})

    assert resp.status_code == 400


@pytest.mark.django_db
def test_checkout_rejects_and_cleans_up_a_course_unpublished_after_being_added(student):
    course = Course.objects.create(
        slug="se-despublica", title="D", organization="museum", price="30.00",
        status=Course.Status.PUBLISHED,
    )
    client = APIClient()
    client.force_authenticate(student)
    client.post("/api/v1/cart/items", {"course_id": course.id})

    course.status = Course.Status.DRAFT
    course.save(update_fields=["status"])

    resp = client.post("/api/v1/orders/checkout")

    assert resp.status_code == 400
    assert Cart.objects.active_for(student).items.count() == 0
    assert not Order.objects.filter(user=student).exists()


# ---------------------------------------------------------------------------
# #24: el super_admin marca una orden como pagada a mano (conciliación
# manual) y eso debe producir exactamente lo que produce el webhook.
# ---------------------------------------------------------------------------


@pytest.fixture
def super_admin():
    return User.objects.create_user(
        email="root@a.com", password="Testpass123", name="Root", role=User.Role.SUPER_ADMIN
    )


@pytest.mark.django_db
def test_admin_marking_an_order_as_paid_enrolls_the_student(student, super_admin):
    from apps.learning.models import Enrollment

    course = Course.objects.create(
        slug="pago-manual", title="PM", organization="museum", price="70.00",
        status=Course.Status.PUBLISHED,
    )
    order = Order.objects.create(user=student, subtotal="70.00", total="70.00")
    from apps.commerce.models import OrderItem

    OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="70.00")
    client = APIClient()
    client.force_authenticate(super_admin)

    resp = client.patch(f"/api/v1/admin/orders/{order.id}", {"payment_status": "paid"})

    assert resp.status_code == 200
    assert Enrollment.objects.filter(user=student, course=course, source=Enrollment.Source.ORDER).exists()


@pytest.mark.django_db
def test_marking_an_already_paid_order_as_paid_again_does_not_duplicate_the_enrollment(student, super_admin):
    from apps.commerce.models import OrderItem
    from apps.learning.models import Enrollment

    course = Course.objects.create(
        slug="pago-manual-2", title="PM2", organization="museum", price="70.00",
        status=Course.Status.PUBLISHED,
    )
    order = Order.objects.create(user=student, subtotal="70.00", total="70.00")
    OrderItem.objects.create(order=order, course=course, title_snapshot=course.title, price_snapshot="70.00")
    client = APIClient()
    client.force_authenticate(super_admin)

    # Primer PATCH: la transición real pending -> paid, la que sí debe enrolar.
    client.patch(f"/api/v1/admin/orders/{order.id}", {"payment_status": "paid"})
    # Segundo PATCH sobre una orden que ya estaba paga: no es una transición,
    # no debe volver a llamar a enroll_from_order.
    client.patch(f"/api/v1/admin/orders/{order.id}", {"transaction_reference": "manual-1"})

    assert Enrollment.objects.filter(user=student, course=course).count() == 1


@pytest.mark.django_db
def test_editing_the_transaction_reference_alone_does_not_enroll_anyone(student, super_admin):
    from apps.learning.models import Enrollment

    course = Course.objects.create(
        slug="solo-referencia", title="SR", organization="museum", price="70.00",
        status=Course.Status.PUBLISHED,
    )
    order = Order.objects.create(user=student, subtotal="70.00", total="70.00")
    client = APIClient()
    client.force_authenticate(super_admin)

    client.patch(f"/api/v1/admin/orders/{order.id}", {"transaction_reference": "ref-123"})

    assert not Enrollment.objects.filter(user=student, course=course).exists()
