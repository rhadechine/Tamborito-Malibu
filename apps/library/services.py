"""Puerta de entrada de Library para otros dominios (ver CourseAccessGrant).

Learning (nivel 3) llama a `grant_course_access` cuando crea una Enrollment;
Library (nivel 2) nunca llama hacia Learning, solo lee su propia copia.
"""

from .models import CourseAccessGrant


def grant_course_access(user, course, via_purchase=False):
    grant, created = CourseAccessGrant.objects.get_or_create(
        user=user, course=course, defaults={"via_purchase": via_purchase}
    )
    if not created and via_purchase and not grant.via_purchase:
        grant.via_purchase = True
        grant.save(update_fields=["via_purchase"])
    return grant


def revoke_course_access(user, course, purchase_only=False):
    """Quita el acceso registrado para (user, course).

    `purchase_only=True` solo degrada el grant: deja de contar como compra
    (pierde `purchased_only`) pero conserva el acceso de inscripción. Se usa
    cuando se reembolsa una orden de un curso al que el usuario además llegó
    por otra vía (inscripción gratuita o manual), para no quitarle un acceso
    que no vino de esa compra.
    """
    grants = CourseAccessGrant.objects.filter(user=user, course=course)
    if purchase_only:
        return grants.update(via_purchase=False)
    return grants.delete()[0]


def has_course_access(user, course, require_purchase=False):
    grants = CourseAccessGrant.objects.filter(user=user, course=course)
    if require_purchase:
        grants = grants.filter(via_purchase=True)
    return grants.exists()
