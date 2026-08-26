"""Split 05 — Courses (sección 16)."""

from decimal import Decimal, InvalidOperation

from django.core.validators import MinValueValidator
from django.db import models

from apps.media.models import MediaAsset


class Instructor(models.Model):
    name = models.CharField(max_length=150)
    title = models.CharField(max_length=150, blank=True)
    avatar_media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    class Organization(models.TextChoices):
        FOUNDATION = "foundation", "Foundation"
        MUSEUM = "museum", "Museum"
        BOTH = "both", "Both"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    subtitle = models.CharField(max_length=300, blank=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    language = models.CharField(max_length=50, default="es")
    duration_hours = models.PositiveIntegerField(default=0)
    price = models.DecimalField(
        max_digits=10, decimal_places=2, default=0, validators=[MinValueValidator(Decimal(0))]
    )
    # Derivado de `price` en save(); no se edita directamente.
    is_free = models.BooleanField(default=False, editable=False)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    featured = models.BooleanField(default=False)
    certificate_enabled = models.BooleanField(default=False)
    cover_media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    instructor = models.ForeignKey(Instructor, on_delete=models.SET_NULL, null=True, blank=True, related_name="courses")
    organization = models.CharField(max_length=16, choices=Organization.choices)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        """`price` es la única fuente de verdad de si un curso es gratuito.

        Con los dos campos independientes se podía tener `is_free=True` y
        `price=200000` a la vez, y la inscripción gratuita
        (`/courses/{id}/enroll-free`) mira `is_free`: un curso de pago se
        regalaba. Ver `apps.learning.services.enroll_free`.
        """
        # `price` puede llegar como str, int o Decimal según cómo se haya
        # instanciado el modelo; se normaliza antes de comparar.
        try:
            price = Decimal(str(self.price))
        except (InvalidOperation, TypeError, ValueError):
            price = None
        self.is_free = price is not None and price <= 0

        update_fields = kwargs.get("update_fields")
        if update_fields is not None:
            update_fields = set(update_fields)
            if "price" in update_fields:
                update_fields.add("is_free")
            kwargs["update_fields"] = update_fields

        super().save(*args, **kwargs)

    def __str__(self):
        return self.slug


class CourseModule(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.course.slug}#{self.title}"


class Lesson(models.Model):
    class Type(models.TextChoices):
        VIDEO = "video", "Video"
        READING = "reading", "Reading"
        QUIZ = "quiz", "Quiz"
        ASSIGNMENT = "assignment", "Assignment"

    module = models.ForeignKey(CourseModule, on_delete=models.CASCADE, related_name="lessons")
    title = models.CharField(max_length=200)
    type = models.CharField(max_length=16, choices=Type.choices)
    minutes = models.PositiveIntegerField(default=0)
    preview = models.BooleanField(default=False)
    summary = models.TextField(blank=True)
    content = models.TextField(blank=True)
    video_media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    reading_resource = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    quiz_schema = models.JSONField(default=dict, blank=True)
    assignment_instructions = models.TextField(blank=True)
    upload_enabled = models.BooleanField(default=False)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.module_id}#{self.title}"


class CourseResource(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="resources")
    name = models.CharField(max_length=200)
    type = models.CharField(max_length=50, blank=True)
    media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True)
    url = models.URLField(blank=True)
    size_label = models.CharField(max_length=50, blank=True)

    def __str__(self):
        return self.name
