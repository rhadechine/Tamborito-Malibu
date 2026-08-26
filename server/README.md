# Tamborito–Malibú Backend

Django + Django REST Framework. Ver el documento
`Arquitectura Técnica Backend — Tamborito–Malibú.md` en la raíz del repo
para el detalle completo de la arquitectura.

## Requisitos

- [uv](https://docs.astral.sh/uv/) como gestor de paquetes y entornos
  virtuales de Python. No se usa `pip`/`venv` manual ni `requirements.txt`.
- Docker + Docker Compose (para PostgreSQL, PgBouncer, Redis, RabbitMQ).

## Entorno virtual y dependencias (uv)

El entorno virtual (`.venv/`) y las dependencias se gestionan enteramente
con `uv`, a partir de `pyproject.toml` + `uv.lock`. No se versiona el
entorno virtual — cualquiera puede reconstruirlo con un solo comando:

```bash
uv sync
```

Esto crea `.venv/` (usando Python 3.12, fijado en `.python-version`) e
instala exactamente las versiones bloqueadas en `uv.lock`, garantizando
entornos reproducibles entre desarrolladores y CI.

Ejecutar cualquier comando dentro del entorno gestionado por `uv`:

```bash
uv run python manage.py <comando>
uv run pytest
uv run ruff check .
```

`uv run` resuelve/activa el entorno automáticamente — no hace falta
`source .venv/bin/activate` (aunque también funciona si se prefiere).

### Agregar / actualizar dependencias

```bash
uv add <paquete>              # dependencia de runtime
uv add --dev <paquete>        # dependencia de desarrollo/testing
uv remove <paquete>
uv lock --upgrade-package <paquete>
```

Cada comando actualiza `pyproject.toml` y `uv.lock` automáticamente;
ambos archivos se commitean.

## Levantar el proyecto

1. Copiar variables de entorno:

   ```bash
   cp .env.example .env
   ```

2. Levantar infraestructura + API con Docker Compose:

   ```bash
   cd docker
   docker compose up --build
   ```

   Esto levanta PostgreSQL, PgBouncer (sección 31.1 de la arquitectura),
   Redis, RabbitMQ, la API Django y un worker de Celery. Django corre
   `migrate` automáticamente al iniciar.

3. Verificar:

   ```text
   GET http://localhost:8000/api/v1/health
   GET http://localhost:8000/api/docs/
   ```

### Desarrollo local sin Docker (solo Django)

Si la infraestructura (Postgres/PgBouncer/Redis/RabbitMQ) ya corre vía
Docker Compose, se puede iterar sobre Django directamente con `uv`:

```bash
uv run python manage.py migrate
uv run python manage.py runserver
```

## Tests

```bash
uv run pytest
```

## Estructura

Ver sección 8 del documento de arquitectura. Resumen:

```text
config/          Settings por ambiente, URLs raíz, Celery app
apps/            Dominios de negocio (se agregan fase a fase)
common/          Utilidades transversales (middleware, excepciones,
                 paginación, permisos, responses)
infrastructure/  Integraciones de infraestructura (storage, messaging,
                 payments, email, observability, PgBouncer)
docker/          Dockerfile, docker-compose.yml, config de PgBouncer
tests/           Tests de integración / e2e
```
