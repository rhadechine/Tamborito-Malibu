"""Sincroniza `is_active` con `status` en las filas ya existentes.

`User.save()` mantiene la invariante de ahora en adelante; esta migración
arregla las cuentas que quedaron con `status` suspendido/inactivo pero
`is_active=True` (y por lo tanto podían seguir iniciando sesión).
"""

from django.db import migrations


def sync_forward(apps, schema_editor):
    User = apps.get_model("identity", "User")
    User.objects.exclude(status="active").update(is_active=False)
    User.objects.filter(status="active").update(is_active=True)


class Migration(migrations.Migration):
    dependencies = [("identity", "0001_initial")]

    operations = [migrations.RunPython(sync_forward, migrations.RunPython.noop)]
