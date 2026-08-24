"""Suscriptores de `common.events` (sección 23, "Eventos consumidores")."""

from common.events import subscribe

from . import services
from .models import Notification


def _on_enrollment_created(enrollment, **_):
    services.notify(
        enrollment.user,
        "Inscripción confirmada",
        f"Ya tienes acceso a «{enrollment.course.title}».",
        type=Notification.Type.ENROLLMENT,
    )


def _on_payment_approved(order, **_):
    services.notify(
        order.user,
        "Pago aprobado",
        f"Tu pago de la orden {order.order_number} fue aprobado.",
        type=Notification.Type.PAYMENT,
    )


def _on_evidence_submitted(evidence, **_):
    services.notify(
        evidence.enrollment.user,
        "Evidencia recibida",
        f"Recibimos tu evidencia para «{evidence.lesson.title}». Un instructor la revisará pronto.",
        type=Notification.Type.EVIDENCE,
    )


def _on_evidence_reviewed(evidence, **_):
    if evidence.status not in ("approved", "rejected"):
        # PATCH parciales que no tocan `status` (p. ej. solo dejar feedback
        # sin cambiar el estado) no cuentan como una resolución.
        return
    title = "Evidencia aprobada" if evidence.status == "approved" else "Evidencia rechazada"
    message = f"Tu evidencia para «{evidence.lesson.title}» fue {evidence.get_status_display().lower()}."
    if evidence.feedback:
        message += f" Comentario del instructor: {evidence.feedback}"
    services.notify(evidence.enrollment.user, title, message, type=Notification.Type.EVIDENCE)


def _on_donation_approved(donation, **_):
    # donation.donor_user puede ser None (donación anónima) — services.notify lo ignora.
    services.notify(
        donation.donor_user,
        "¡Gracias por tu donación!",
        f"Tu donación de {donation.amount} {donation.currency} fue confirmada.",
        type=Notification.Type.DONATION,
    )


def _on_account_status_changed(user, **_):
    services.notify(
        user,
        "Estado de tu cuenta actualizado",
        f"Tu cuenta ahora está: {user.get_status_display()}.",
        type=Notification.Type.ACCOUNT,
    )


def _on_certificate_issued(certificate, **_):
    services.notify(
        certificate.user,
        "¡Certificado emitido!",
        f"Tu certificado de «{certificate.course.title}» ya está disponible (código {certificate.code}).",
        type=Notification.Type.CERTIFICATE,
    )


def register():
    subscribe("enrollment.created", _on_enrollment_created)
    subscribe("payment.approved", _on_payment_approved)
    subscribe("evidence.submitted", _on_evidence_submitted)
    subscribe("evidence.reviewed", _on_evidence_reviewed)
    subscribe("donation.approved", _on_donation_approved)
    subscribe("account.status_changed", _on_account_status_changed)
    subscribe("certificate.issued", _on_certificate_issued)
