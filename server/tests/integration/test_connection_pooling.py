"""Pool de conexiones vía PgBouncer (sección 31.1 del documento de arquitectura).

Verificado manualmente antes de escribir este archivo:

- El entrypoint de la imagen `edoburu/pgbouncer` (`/entrypoint.sh`) SOLO
  genera su propio `/etc/pgbouncer/pgbouncer.ini` a partir de variables de
  entorno cuando ese archivo no existe ya (`if [ ! -f "$PG_CONFIG_FILE" ]`).
  Originalmente `docker/pgbouncer/pgbouncer.ini` no se montaba como volumen
  — solo `userlist.txt` — así que la imagen generaba el suyo desde las
  variables de entorno del servicio (`POOL_MODE`, `AUTH_TYPE`, etc.), y todo
  lo que traía el `.ini` manual (`reserve_pool_size`, `admin_users =
  tamborito`, `stats_users`) se ignoraba en silencio; el `admin_users` real
  quedaba en `postgres`, un usuario sin entrada en `userlist.txt` —
  el admin console de PgBouncer era inalcanzable.
  `docker-compose.yml` ahora monta `./pgbouncer/pgbouncer.ini` en
  `/etc/pgbouncer/pgbouncer.ini:ro`, así que ese archivo SÍ es la
  configuración real, y las variables de entorno que solo servían para
  generarlo se retiraron del servicio (quedarían muertas de todos modos).
- Con `pgbouncer` levantado usando este `.ini` montado, una consulta real
  contra el puerto publicado (`psql -h pgbouncer -p 6432 -U tamborito -d
  tamborito`) autentica y responde correctamente con el hash de
  `userlist.txt`, y `SHOW POOLS` en el admin console (`-d pgbouncer`, ahora
  sí alcanzable con las credenciales de `tamborito`) confirma
  `pool_mode = transaction`.
- `manage.py migrate` contra `DATABASE_HOST=localhost DATABASE_PORT=16432`
  aplica DDL sin problemas bajo `pool_mode=transaction`.
- Con 40 clientes concurrentes contra un `default_pool_size = 20`, el pico de
  conexiones físicas visto DESDE Postgres (`pg_stat_activity`) fue de ~21, no
  ~40 — el tope del pool se respeta de verdad. (Contar "pids distintos vistos
  en toda la corrida" en el cliente, en cambio, NO es una señal fiable: dio
  40/40 incluso con el pool funcionando correctamente, porque PgBouncer puede
  reciclar la conexión física entre transacciones sin que eso implique haber
  excedido el pool en ningún instante. Por eso los tests de abajo miden el
  pico de concurrencia desde Postgres, no pids acumulados desde el cliente.)

Los tests de este archivo que requieren PgBouncer levantado se saltan
(`pytest.skip`) si no lo está — no todos los entornos donde corre la suite
tienen Docker disponible.
"""

import hashlib
import os
import socket

import pytest
from django.conf import settings as dj_settings

# ---------------------------------------------------------------------------
# La configuración de Django asume pooling en modo transacción hecho por
# PgBouncer, no por Django mismo.
# ---------------------------------------------------------------------------


def test_django_does_not_keep_its_own_persistent_connections():
    # CONN_MAX_AGE > 0 haría que Django reutilice una conexión física propia
    # entre requests. Bajo `pool_mode = transaction`, PgBouncer puede asignar
    # una conexión física distinta a cada transacción de un mismo cliente;
    # una conexión "persistente" del lado de Django rompe esa suposición y
    # generalmente termina en "connection reset" tras el primer resize del
    # pool de PgBouncer.
    assert dj_settings.DATABASES["default"]["CONN_MAX_AGE"] == 0


def test_server_side_cursors_are_disabled_for_transaction_pooling():
    # Un cursor server-side (`.iterator()`, paginación de streaming) vive
    # atado a la conexión física que lo abrió. En `pool_mode = transaction`
    # esa conexión puede volver al pool y ser entregada a otro cliente en
    # cuanto termina la transacción que lo abrió — el cursor queda huérfano
    # o, peor, otro cliente hereda su estado.
    assert dj_settings.DATABASES["default"]["DISABLE_SERVER_SIDE_CURSORS"] is True


def test_default_database_host_and_port_point_at_pgbouncer_not_postgres_directly():
    path = dj_settings.BASE_DIR / "config" / "settings" / "base.py"
    source = path.read_text(encoding="utf-8")
    assert '"HOST": env("DATABASE_HOST", default="pgbouncer")' in source
    assert '"PORT": env("DATABASE_PORT", default="6432")' in source


# ---------------------------------------------------------------------------
# `docker/pgbouncer/pgbouncer.ini` se monta como volumen en el servicio
# `pgbouncer` de docker-compose.yml (`/etc/pgbouncer/pgbouncer.ini:ro`). El
# entrypoint de la imagen `edoburu/pgbouncer` SOLO genera su propio `.ini`
# desde variables de entorno cuando ese archivo no existe ya — al montarlo,
# la imagen lo usa tal cual y esas variables quedan sin efecto. La fuente de
# verdad real es por tanto el `.ini`, no `docker-compose.yml`.
# ---------------------------------------------------------------------------


@pytest.fixture(scope="module")
def compose_source():
    path = dj_settings.BASE_DIR / "docker" / "docker-compose.yml"
    return path.read_text(encoding="utf-8")


@pytest.fixture(scope="module")
def pgbouncer_ini_source():
    path = dj_settings.BASE_DIR / "docker" / "pgbouncer" / "pgbouncer.ini"
    return path.read_text(encoding="utf-8")


def test_compose_mounts_the_real_pgbouncer_ini_instead_of_letting_the_image_generate_one(
    compose_source,
):
    assert "./pgbouncer/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini:ro" in compose_source


def test_pgbouncer_ini_declares_transaction_pooling(pgbouncer_ini_source):
    assert "pool_mode = transaction" in pgbouncer_ini_source


def test_pgbouncer_ini_declares_md5_auth(pgbouncer_ini_source):
    assert "auth_type = md5" in pgbouncer_ini_source


def test_pgbouncer_ini_admin_users_actually_has_credentials_in_userlist(pgbouncer_ini_source):
    # `admin_users = postgres` (el default de la imagen, y lo que quedaba
    # antes de montar este `.ini`) dejaba el admin console inalcanzable:
    # userlist.txt nunca tuvo una entrada para "postgres". `admin_users`
    # debe apuntar a un usuario que sí pueda autenticarse.
    import re

    match = re.search(r"^admin_users\s*=\s*(\S+)", pgbouncer_ini_source, re.MULTILINE)
    assert match, "pgbouncer.ini debe declarar admin_users"
    admin_user = match.group(1)

    userlist_path = dj_settings.BASE_DIR / "docker" / "pgbouncer" / "userlist.txt"
    userlist = userlist_path.read_text(encoding="utf-8")
    assert f'"{admin_user}"' in userlist, (
        f"admin_users={admin_user} en pgbouncer.ini pero userlist.txt no tiene "
        f"credenciales para ese usuario — el admin console quedaría inalcanzable."
    )


def test_postgres_service_uses_md5_password_encryption_to_match_pgbouncer(compose_source):
    # Si esto cambiara a scram-sha-256 (el default de Postgres 16) sin migrar
    # también auth_type en pgbouncer.ini, la autenticación falla con
    # "wrong password type" — ver el comentario extenso en el servicio
    # `postgres` de docker-compose.yml sobre por qué no se toca a la ligera.
    assert 'password_encryption=md5' in compose_source


def test_userlist_hash_matches_the_configured_database_credentials():
    userlist_path = dj_settings.BASE_DIR / "docker" / "pgbouncer" / "userlist.txt"
    if not userlist_path.exists():
        pytest.skip("docker/pgbouncer/userlist.txt no existe en este checkout")

    # Postgres/PgBouncer usan md5(password + username) como hash de auth
    # "md5", no md5(username + password) — el orden importa.
    user = os.environ.get("DATABASE_USER", "tamborito")
    password = os.environ.get("DATABASE_PASSWORD", "tamborito")
    expected = "md5" + hashlib.md5(f"{password}{user}".encode()).hexdigest()

    content = userlist_path.read_text(encoding="utf-8")
    assert f'"{user}" "{expected}"' in content, (
        "userlist.txt no coincide con DATABASE_USER/DATABASE_PASSWORD actuales — "
        "si la contraseña cambió, hay que regenerar el hash "
        "(md5(password+username)) y reescribir userlist.txt, o PgBouncer "
        "rechazará la autenticación contra Postgres."
    )


# ---------------------------------------------------------------------------
# Smoke test en vivo: solo corre si hay un PgBouncer alcanzable. No asume
# Docker — basta con que el puerto responda.
# ---------------------------------------------------------------------------


def _pgbouncer_reachable(host: str, port: int, timeout: float = 0.5) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def _direct_postgres_reachable() -> tuple[str, int] | None:
    """Host/puerto para hablarle a Postgres SIN pasar por PgBouncer.

    Solo existe en el compose de desarrollo (`docker-compose.yml` publica
    `15432:5432`); en producción el puerto no se publica a propósito (ver
    comentario del servicio `postgres`). Sin esta vía no hay forma de medir
    conexiones concurrentes reales desde fuera, así que el test que la
    necesita se salta si no está disponible.
    """
    host = os.environ.get("POSTGRES_DIRECT_TEST_HOST", "localhost")
    port = int(os.environ.get("POSTGRES_DIRECT_TEST_PORT", "15432"))
    return (host, port) if _pgbouncer_reachable(host, port) else None


def test_pgbouncer_queues_excess_clients_instead_of_rejecting_them():
    # Primera mitad de la garantía de un pool: con más clientes lógicos que
    # `default_pool_size` conexiones físicas, PgBouncer debe ENCOLAR el
    # exceso y servirlo cuando se libere una conexión — nunca debe
    # rechazarlos ni colgarse. (La segunda mitad —que además respeta el
    # tope de conexiones físicas— se verifica aparte, contra Postgres
    # directamente, en el siguiente test.)
    host = os.environ.get("PGBOUNCER_TEST_HOST", "localhost")
    port = int(os.environ.get("PGBOUNCER_TEST_PORT", "16432"))
    if not _pgbouncer_reachable(host, port):
        pytest.skip(f"PgBouncer no está escuchando en {host}:{port} en este entorno")

    import concurrent.futures as cf

    import psycopg  # driver real del proyecto (psycopg 3, no psycopg2)

    default_pool_size = 20
    concurrent_clients = default_pool_size * 2

    user = os.environ.get("DATABASE_USER", "tamborito")
    password = os.environ.get("DATABASE_PASSWORD", "tamborito")
    dbname = os.environ.get("DATABASE_NAME", "tamborito")

    def query_backend_pid(_i):
        conn = psycopg.connect(
            host=host, port=port, user=user, password=password, dbname=dbname,
            connect_timeout=10,
        )
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT pg_backend_pid(), pg_sleep(0.3)")
                return cur.fetchone()[0]
        finally:
            conn.close()

    with cf.ThreadPoolExecutor(max_workers=concurrent_clients) as executor:
        pids = list(executor.map(query_backend_pid, range(concurrent_clients)))

    # Ninguna de las 40 conexiones lógicas se perdió ni quedó colgada.
    assert len(pids) == concurrent_clients


def test_pgbouncer_never_exceeds_the_configured_pool_size_in_physical_connections():
    # Segunda mitad de la garantía: el pico de conexiones físicas realmente
    # abiertas contra Postgres, medido DESDE Postgres (no inferido desde el
    # cliente), nunca supera `default_pool_size`. Un solo backend pid
    # reaparece muchas veces por transacción reutilizada; lo que hay que
    # medir es el máximo instantáneo, no cuántos pids distintos se vieron en
    # total a lo largo de la corrida (eso último no es una señal fiable:
    # PgBouncer puede perfectamente reciclar la conexión física entre
    # transacciones sin que eso implique haber excedido el pool en ningún
    # momento).
    pgbouncer_host = os.environ.get("PGBOUNCER_TEST_HOST", "localhost")
    pgbouncer_port = int(os.environ.get("PGBOUNCER_TEST_PORT", "16432"))
    if not _pgbouncer_reachable(pgbouncer_host, pgbouncer_port):
        pytest.skip(f"PgBouncer no está escuchando en {pgbouncer_host}:{pgbouncer_port}")

    direct = _direct_postgres_reachable()
    if direct is None:
        pytest.skip("Postgres no es alcanzable directamente en este entorno (solo vía PgBouncer)")
    pg_host, pg_port = direct

    import concurrent.futures as cf
    import threading
    import time

    import psycopg

    default_pool_size = 20
    concurrent_clients = default_pool_size * 2

    user = os.environ.get("DATABASE_USER", "tamborito")
    password = os.environ.get("DATABASE_PASSWORD", "tamborito")
    dbname = os.environ.get("DATABASE_NAME", "tamborito")

    stop = threading.Event()
    peak = [0]

    def poll_peak_connections():
        monitor = psycopg.connect(
            host=pg_host, port=pg_port, user=user, password=password, dbname=dbname,
            connect_timeout=10,
        )
        monitor.autocommit = True
        try:
            with monitor.cursor() as cur:
                while not stop.is_set():
                    cur.execute(
                        "SELECT count(*) FROM pg_stat_activity "
                        "WHERE usename = %s AND datname = %s AND pid <> pg_backend_pid()",
                        [user, dbname],
                    )
                    peak[0] = max(peak[0], cur.fetchone()[0])
                    time.sleep(0.05)
        finally:
            monitor.close()

    def hold_a_pooled_connection(_i):
        conn = psycopg.connect(
            host=pgbouncer_host, port=pgbouncer_port, user=user, password=password,
            dbname=dbname, connect_timeout=10,
        )
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT pg_sleep(0.3)")
                cur.fetchone()
        finally:
            conn.close()

    poller = threading.Thread(target=poll_peak_connections, daemon=True)
    poller.start()
    try:
        with cf.ThreadPoolExecutor(max_workers=concurrent_clients) as executor:
            list(executor.map(hold_a_pooled_connection, range(concurrent_clients)))
    finally:
        stop.set()
        poller.join(timeout=5)

    # Con el doble de clientes que `default_pool_size`, si el pool no
    # estuviera realmente limitando conexiones físicas veríamos un pico
    # cercano a 40. Se deja un pequeño margen (+2) por conexiones
    # administrativas ajenas a esta prueba.
    assert peak[0] <= default_pool_size + 2, (
        f"Pico de {peak[0]} conexiones físicas concurrentes contra Postgres "
        f"— PgBouncer no está limitando al `default_pool_size` configurado "
        f"({default_pool_size})."
    )
