import pytest
from rest_framework.test import APIClient

from apps.courses.models import Course, CourseModule, Lesson
from apps.identity.models import User


@pytest.fixture
def admin():
    return User.objects.create_user(
        email="admin2@a.com", password="Testpass123", name="Admin", role=User.Role.SUPER_ADMIN
    )


@pytest.mark.django_db
def test_public_list_hides_draft_courses():
    Course.objects.create(slug="draft", title="D", organization="museum", status=Course.Status.DRAFT)
    Course.objects.create(slug="live", title="L", organization="museum", status=Course.Status.PUBLISHED)

    resp = APIClient().get("/api/v1/courses")

    assert resp.status_code == 200
    slugs = [c["slug"] for c in resp.data["data"]]
    assert slugs == ["live"]


@pytest.mark.django_db
def test_preview_returns_only_preview_lessons():
    course = Course.objects.create(slug="c1", title="C1", organization="museum", status=Course.Status.PUBLISHED)
    module = CourseModule.objects.create(course=course, title="M1")
    Lesson.objects.create(module=module, title="Intro", type=Lesson.Type.VIDEO, preview=True)
    Lesson.objects.create(module=module, title="Locked", type=Lesson.Type.VIDEO, preview=False)

    resp = APIClient().get(f"/api/v1/courses/{course.id}/preview")

    titles = [item["title"] for item in resp.data["data"]["preview_lessons"]]
    assert titles == ["Intro"]


@pytest.mark.django_db
def test_publish_action_changes_status():
    from apps.identity.models import User

    admin = User.objects.create_user(
        email="admin@a.com", password="Testpass123", name="Admin", role=User.Role.SUPER_ADMIN
    )
    course = Course.objects.create(slug="c2", title="C2", organization="museum")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.post(f"/api/v1/admin/courses/{course.id}/publish")

    assert resp.status_code == 200
    course.refresh_from_db()
    assert course.status == Course.Status.PUBLISHED


@pytest.mark.django_db
def test_admin_can_retrieve_a_single_module(admin):
    course = Course.objects.create(slug="c3", title="C3", organization="museum")
    module = CourseModule.objects.create(course=course, title="M1")
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get(f"/api/v1/admin/modules/{module.id}")

    assert resp.status_code == 200
    assert resp.data["data"]["title"] == "M1"


@pytest.mark.django_db
def test_admin_can_retrieve_a_single_lesson(admin):
    course = Course.objects.create(slug="c4", title="C4", organization="museum")
    module = CourseModule.objects.create(course=course, title="M1")
    lesson = Lesson.objects.create(module=module, title="L1", type=Lesson.Type.READING)
    client = APIClient()
    client.force_authenticate(admin)

    resp = client.get(f"/api/v1/admin/lessons/{lesson.id}")

    assert resp.status_code == 200
    assert resp.data["data"]["title"] == "L1"
