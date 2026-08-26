from common.events import dispatch

from .models import Certificate


def issue_certificate(enrollment):
    """course.completed -> Certificate, solo si el curso lo tiene habilitado (sección 17)."""
    if not enrollment.course.certificate_enabled:
        return None
    certificate, created = Certificate.objects.get_or_create(user=enrollment.user, course=enrollment.course)
    if created:
        # ponytail: la generación del PDF (sección 29, tarea Celery "PDF generation")
        # no está implementada — `pdf_media` queda vacío hasta esa pieza.
        dispatch("certificate.issued", certificate=certificate)
    return certificate


def revoke_for_order(order):
    """payment.refunded -> se invalidan los certificados de esa compra.

    Se marca `revoked_at` en vez de borrar la fila: la verificación pública
    (`/certificates/verify/{code}`) debe poder responder "existe pero ya no es
    válido", no un 404 ambiguo.
    """
    from django.utils import timezone

    revoked = []
    course_ids = list(
        order.items.filter(course__isnull=False).values_list("course_id", flat=True)
    )
    certificates = Certificate.objects.filter(
        user=order.user, course_id__in=course_ids, revoked_at__isnull=True
    )
    for certificate in certificates:
        certificate.revoked_at = timezone.now()
        certificate.save(update_fields=["revoked_at"])
        revoked.append(certificate)
    return revoked
