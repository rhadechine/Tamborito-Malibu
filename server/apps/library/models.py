"""Split 10 — Library (sección 21)."""

from django.conf import settings
from django.db import models

from apps.media.models import MediaAsset


class LibraryResource(models.Model):
    class Type(models.TextChoices):
        DOCUMENT = "document", "Document"
        VIDEO = "video", "Video"
        AUDIO = "audio", "Audio"
        IMAGE = "image", "Image"
        LINK = "link", "Link"

    class Access(models.TextChoices):
        PUBLIC = "public", "Public"
        PRIVATE = "private", "Private"
        ENROLLED_ONLY = "enrolled_only", "Enrolled only"
        PURCHASED_ONLY = "purchased_only", "Purchased only"

    class Organization(models.TextChoices):
        FOUNDATION = "foundation", "Foundation"
        MUSEUM = "museum", "Museum"
        BOTH = "both", "Both"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    type = models.CharField(max_length=16, choices=Type.choices)
    access = models.CharField(
        max_length=16,
        choices=Access.choices,
        default=Access.PUBLIC,
        help_text=(
            "public: visible sin sesión. "
            "private: visible para CUALQUIER usuario con sesión iniciada — no "
            "significa «solo el equipo interno»; para material interno deja el "
            "recurso en status=draft, que no se lista ni se descarga. "
            "enrolled_only / purchased_only: exigen un curso asociado; sin él el "
            "recurso queda inaccesible (falla cerrado)."
        ),
    )
    organization = models.CharField(max_length=16, choices=Organization.choices)
    media = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True)
    # No está en el listado de campos de la sección 21, pero es indispensable para
    # poder resolver `enrolled_only`/`purchased_only` contra un curso concreto.
    course = models.ForeignKey(
        "courses.Course", on_delete=models.SET_NULL, null=True, blank=True, related_name="library_resources"
    )
    external_url = models.URLField(blank=True)
    author = models.CharField(max_length=200, blank=True)
    published_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.DRAFT)

    def __str__(self):
        return self.slug


class CourseAccessGrant(models.Model):
    """Read model propio de Library (sección 4 — cada dominio es dueño de sus
    tablas) que registra qué usuario tiene acceso a qué curso.

    Library (nivel 2) no puede importar Learning (nivel 3) para preguntarle en
    caliente "¿está inscrito?" — violaría la jerarquía de importación de la
    sección 50. La relación permitida es la inversa: Learning, al crear una
    Enrollment (gratis, pagada o manual), llama a
    `apps.library.services.grant_course_access(...)` para dejar aquí una copia
    de lectura. `enrolled_only`/`purchased_only` se resuelven consultando esta
    tabla, nunca las tablas de Learning ni de Commerce directamente.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="library_access_grants")
    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE, related_name="library_access_grants")
    via_purchase = models.BooleanField(default=False)
    granted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ["user", "course"]

    def __str__(self):
        return f"grant#{self.id}({self.user_id}, {self.course_id})"


class ResourceAccessLog(models.Model):
    # nullable: sección 21 permite recursos `public`, visibles sin sesión.
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="library_logs"
    )
    resource = models.ForeignKey(LibraryResource, on_delete=models.CASCADE, related_name="access_logs")
    action = models.CharField(max_length=20, default="view")
    created_at = models.DateTimeField(auto_now_add=True)
