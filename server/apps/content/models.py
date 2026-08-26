"""Split 03 — Content/CMS (sección 14)."""

from django.db import models


class Page(models.Model):
    class Organization(models.TextChoices):
        FOUNDATION = "foundation", "Foundation"
        MUSEUM = "museum", "Museum"
        BOTH = "both", "Both"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    slug = models.SlugField(unique=True)
    organization = models.CharField(max_length=16, choices=Organization.choices)
    title = models.CharField(max_length=200)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)
    seo_title = models.CharField(max_length=200, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.slug


class PageSection(models.Model):
    page = models.ForeignKey(Page, on_delete=models.CASCADE, related_name="sections")
    type = models.CharField(max_length=50)
    title = models.CharField(max_length=200, blank=True)
    subtitle = models.CharField(max_length=300, blank=True)
    body = models.TextField(blank=True)
    # ponytail: URL plano hasta que exista apps.media (Split 04); migrar a FK MediaAsset ahí.
    media = models.URLField(blank=True)
    position = models.PositiveIntegerField(default=0)
    metadata_json = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.page.slug}#{self.type}"
