"""Split 06 — Learning (sección 17).

Regla: una inscripción activa por curso -> un único registro Enrollment por
(user, course); curso gratuito se inscribe directo, curso pago se inscribe
mediante `services.enroll_from_order` al recibir payment.approved.
"""

from django.conf import settings
from django.db import models

from apps.courses.models import Course, Lesson
from apps.media.models import MediaAsset


class Enrollment(models.Model):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    class Source(models.TextChoices):
        FREE = "free", "Free"
        ORDER = "order", "Order"
        ADMIN = "admin", "Admin"

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.ACTIVE)
    source = models.CharField(max_length=16, choices=Source.choices)
    order = models.ForeignKey(
        "commerce.Order", on_delete=models.SET_NULL, null=True, blank=True, related_name="enrollments"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_lesson = models.ForeignKey(Lesson, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    attendance = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        unique_together = ["user", "course"]

    def __str__(self):
        return f"enrollment#{self.id}({self.user_id}, {self.course_id})"


class LessonProgress(models.Model):
    class Status(models.TextChoices):
        IN_PROGRESS = "in_progress", "In progress"
        COMPLETED = "completed", "Completed"

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name="lesson_progress")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.COMPLETED)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_spent_seconds = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ["enrollment", "lesson"]


class Evidence(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name="evidences")
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="evidences")
    file_media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveBigIntegerField(default=0)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    feedback = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
