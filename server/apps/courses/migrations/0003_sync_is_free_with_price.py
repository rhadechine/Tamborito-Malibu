"""Sincroniza `is_free` con `price` en las filas ya existentes.

`Course.save()` mantiene la invariante de ahora en adelante; esto corrige los
cursos que quedaron marcados como gratuitos teniendo precio (o al revés), que
era lo que permitía regalar un curso de pago vía `/enroll-free`.
"""

from django.db import migrations


def sync_forward(apps, schema_editor):
    Course = apps.get_model("courses", "Course")
    Course.objects.filter(price__lte=0).update(is_free=True)
    Course.objects.filter(price__gt=0).update(is_free=False)


class Migration(migrations.Migration):
    dependencies = [("courses", "0002_alter_course_is_free_alter_course_price")]

    operations = [migrations.RunPython(sync_forward, migrations.RunPython.noop)]
