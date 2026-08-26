"""Suscriptores de `common.events` — catálogo de la sección 27.

Audit es nivel 1 (sección 50): no puede importar Courses/Learning/Commerce/
Payments/Donations/Certificates (todos superiores) para enterarse de sus
acciones. Se suscribe al bus (`common.events`, nivel 0) igual que
Notifications/Certificates, así ningún dominio de negocio importa Audit.

`ip_address`/`user_agent` quedan vacíos en las entradas generadas por
eventos: los publicadores no propagan el `request` a través del bus, solo
los objetos de dominio. Completar esos campos requeriría pasar el `request`
en cada `dispatch(...)`, lo cual no se justifica todavía.

`payment.refunded` se suscribe pero no tiene productor: el repo no
implementa ningún flujo de reembolso todavía (Payments solo procesa
approved/rejected/expired vía el webhook de PayU).
"""

from common.events import subscribe

from . import services


def _on_user_registered(user, **_):
    services.record("user.registered", actor_user=user, entity_type="User", entity_id=user.id)


def _on_course_created(course, **_):
    services.record(
        "course.created", entity_type="Course", entity_id=course.id, organization=course.organization
    )


def _on_course_updated(course, **_):
    services.record(
        "course.updated", entity_type="Course", entity_id=course.id, organization=course.organization
    )


def _on_course_published(course, **_):
    services.record(
        "course.published", entity_type="Course", entity_id=course.id, organization=course.organization
    )


def _on_course_archived(course, **_):
    services.record(
        "course.archived", entity_type="Course", entity_id=course.id, organization=course.organization
    )


def _on_enrollment_created(enrollment, **_):
    services.record(
        "enrollment.created", actor_user=enrollment.user, entity_type="Enrollment", entity_id=enrollment.id
    )


def _on_evidence_submitted(evidence, **_):
    services.record(
        "evidence.submitted",
        actor_user=evidence.enrollment.user,
        entity_type="Evidence",
        entity_id=evidence.id,
    )


def _on_order_created(order, **_):
    services.record("order.created", actor_user=order.user, entity_type="Order", entity_id=order.id)


def _on_payment_approved(order, **_):
    services.record("payment.approved", actor_user=order.user, entity_type="Order", entity_id=order.id)


def _on_payment_refunded(order, **_):
    services.record("payment.refunded", actor_user=order.user, entity_type="Order", entity_id=order.id)


def _on_donation_approved(donation, **_):
    services.record(
        "donation.approved", actor_user=donation.donor_user, entity_type="Donation", entity_id=donation.id
    )


def _on_certificate_issued(certificate, **_):
    services.record(
        "certificate.issued", actor_user=certificate.user, entity_type="Certificate", entity_id=certificate.id
    )


def _on_settings_updated(settings_row, actor_user=None, **_):
    services.record(
        "settings.updated", actor_user=actor_user, entity_type="PlatformSettings", entity_id=settings_row.id
    )


def _on_museum_piece_created(piece, **_):
    services.record("museum.piece.created", entity_type="MuseumPiece", entity_id=piece.id)


def _on_museum_piece_updated(piece, **_):
    services.record("museum.piece.updated", entity_type="MuseumPiece", entity_id=piece.id)


def register():
    subscribe("user.registered", _on_user_registered)
    subscribe("course.created", _on_course_created)
    subscribe("course.updated", _on_course_updated)
    subscribe("course.published", _on_course_published)
    subscribe("course.archived", _on_course_archived)
    subscribe("enrollment.created", _on_enrollment_created)
    subscribe("evidence.submitted", _on_evidence_submitted)
    subscribe("order.created", _on_order_created)
    subscribe("payment.approved", _on_payment_approved)
    subscribe("payment.refunded", _on_payment_refunded)
    subscribe("donation.approved", _on_donation_approved)
    subscribe("certificate.issued", _on_certificate_issued)
    subscribe("settings.updated", _on_settings_updated)
    subscribe("museum.piece.created", _on_museum_piece_created)
    subscribe("museum.piece.updated", _on_museum_piece_updated)
