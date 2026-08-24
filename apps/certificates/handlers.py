from common.events import subscribe

from . import services


def _on_course_completed(enrollment, **_):
    services.issue_certificate(enrollment)


def _on_payment_refunded(order, **_):
    services.revoke_for_order(order)


def register():
    subscribe("course.completed", _on_course_completed)
    subscribe("payment.refunded", _on_payment_refunded)
