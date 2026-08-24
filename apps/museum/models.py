"""Split 11 — Museum (sección 22)."""

from django.db import models

from apps.media.models import MediaAsset


class Status(models.TextChoices):
    DRAFT = "draft", "Draft"
    PUBLISHED = "published", "Published"
    ARCHIVED = "archived", "Archived"


class CollectionGroup(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    slug = models.SlugField(unique=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    position = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return self.title


class MuseumPiece(models.Model):
    collection_group = models.ForeignKey(
        CollectionGroup, on_delete=models.SET_NULL, null=True, blank=True, related_name="pieces"
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    material = models.CharField(max_length=200, blank=True)
    history = models.TextField(blank=True)
    description = models.TextField(blank=True)
    conservation_status = models.CharField(max_length=100, blank=True)
    origin_context = models.CharField(max_length=200, blank=True)
    period_label = models.CharField(max_length=100, blank=True)
    main_image_media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name="+")
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class MuseumExhibition(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    type = models.CharField(max_length=50, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.title
