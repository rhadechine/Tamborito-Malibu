from django.contrib import admin

from .models import Course, CourseModule, CourseResource, Instructor, Lesson


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0


class CourseResourceInline(admin.TabularInline):
    model = CourseResource
    extra = 0


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ["slug", "title", "organization", "status", "featured"]
    list_filter = ["organization", "status", "featured"]
    search_fields = ["slug", "title"]
    inlines = [CourseModuleInline]


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ["course", "title", "position"]
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ["module", "title", "type", "position"]
    inlines = [CourseResourceInline]


@admin.register(Instructor)
class InstructorAdmin(admin.ModelAdmin):
    list_display = ["name", "title"]
