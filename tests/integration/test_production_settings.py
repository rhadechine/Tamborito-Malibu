"""Config de producción (#18-#21, #33 de la revisión de seguridad).

`config.settings.production` no se importa nunca en vivo aquí. Su cuerpo
ejecuta guardas que revientan si el `.env` local no trae credenciales
"de producción" (sección 19/29) — que es exactamente lo que se busca en un
despliegue real, pero significa que importar el módulo hace que la
COLECCIÓN de toda la suite dependa de qué haya en el `.env` de quien la
corra. En su lugar:

- Las guardas (`common.settings_guards`) son funciones puras: se prueban
  llamándolas directamente con valores de prueba, sin tocar ningún módulo
  de settings.
- Las asignaciones estáticas de `production.py` (headers de seguridad,
  permisos de `/api/docs`) y la invocación de las guardas se verifican
  leyendo el código fuente del archivo, no ejecutándolo.
"""

import pytest
import yaml
from django.conf import settings as dj_settings
from django.core.exceptions import ImproperlyConfigured

from common.settings_guards import (
    INSECURE_BROKER_CREDENTIALS,
    INSECURE_SECRET_KEY_DEFAULT,
    require_real_broker_credentials,
    require_real_secret_key,
)


def test_require_real_secret_key_rejects_the_example_default():
    with pytest.raises(ImproperlyConfigured):
        require_real_secret_key(INSECURE_SECRET_KEY_DEFAULT)


def test_require_real_secret_key_accepts_a_real_key():
    require_real_secret_key("una-clave-generada-de-verdad-no-el-ejemplo")


def test_require_real_broker_credentials_rejects_the_example_default():
    with pytest.raises(ImproperlyConfigured):
        require_real_broker_credentials(f"amqp://{INSECURE_BROKER_CREDENTIALS}@rabbitmq:5672//")


def test_require_real_broker_credentials_accepts_real_credentials():
    require_real_broker_credentials("amqp://tamborito:una-clave-real@rabbitmq:5672//")


@pytest.fixture(scope="module")
def production_source():
    path = dj_settings.BASE_DIR / "config" / "settings" / "production.py"
    return path.read_text(encoding="utf-8")


def test_production_calls_both_settings_guards(production_source):
    assert "require_real_secret_key(SECRET_KEY)" in production_source
    assert "require_real_broker_credentials(CELERY_BROKER_URL)" in production_source


def test_production_trusts_the_reverse_proxy_forwarded_proto_header(production_source):
    # Sin esto, SECURE_SSL_REDIRECT entra en bucle infinito detrás de Nginx
    # (sección 49): `request.is_secure()` nunca da True.
    assert 'SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")' in production_source


def test_production_still_forces_https_and_secure_cookies(production_source):
    assert "SECURE_SSL_REDIRECT = True" in production_source
    assert "SESSION_COOKIE_SECURE = True" in production_source
    assert "CSRF_COOKIE_SECURE = True" in production_source


def test_production_restricts_the_openapi_docs_to_staff(production_source):
    assert '"SERVE_PERMISSIONS": ["rest_framework.permissions.IsAdminUser"]' in production_source
    assert "SERVE_AUTHENTICATION" in production_source


def test_development_keeps_the_docs_open_for_convenience():
    from config.settings import development

    # development.py no sobreescribe SPECTACULAR_SETTINGS: hereda el
    # AllowAny por defecto de drf-spectacular, a propósito.
    assert "SERVE_PERMISSIONS" not in vars(development)


# ---------------------------------------------------------------------------
# #18: el compose de producción no hereda `--reload`, el bind-mount del
# código fuente, ni `DJANGO_SETTINGS_MODULE=development`.
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def merged_prod_compose():
    import subprocess

    server_dir = dj_settings.BASE_DIR
    result = subprocess.run(
        [
            "docker", "compose",
            "-f", str(server_dir / "docker" / "docker-compose.yml"),
            "-f", str(server_dir / "docker" / "docker-compose.prod.yml"),
            "config",
        ],
        check=False,
        capture_output=True, text=True, cwd=server_dir,
    )
    if result.returncode != 0:
        pytest.skip(f"docker compose no disponible en este entorno: {result.stderr[:200]}")
    return yaml.safe_load(result.stdout)


def test_prod_compose_web_does_not_use_reload_or_the_dev_settings_module(merged_prod_compose):
    web = merged_prod_compose["services"]["web"]

    command = " ".join(web["command"]) if isinstance(web["command"], list) else web["command"]
    assert "--reload" not in command
    assert web["environment"]["DJANGO_SETTINGS_MODULE"] == "config.settings.production"


def test_prod_compose_web_does_not_bind_mount_the_source_tree(merged_prod_compose):
    web = merged_prod_compose["services"]["web"]
    assert not web.get("volumes")


def test_prod_compose_does_not_publish_postgres_or_pgbouncer_ports(merged_prod_compose):
    assert not merged_prod_compose["services"]["postgres"].get("ports")
    assert not merged_prod_compose["services"]["pgbouncer"].get("ports")


def test_dev_compose_is_untouched_and_still_uses_reload():
    compose_path = dj_settings.BASE_DIR / "docker" / "docker-compose.yml"
    content = compose_path.read_text(encoding="utf-8")
    assert "--reload" in content
    assert "config.settings.development" in content
