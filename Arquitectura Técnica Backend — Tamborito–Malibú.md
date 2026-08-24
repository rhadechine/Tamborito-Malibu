# Arquitectura Técnica Backend — Tamborito–Malibú

**Stack definitivo: Django + Django REST Framework**

**Versión:** 2.0  
**Estado:** Arquitectura técnica definitiva  
**Backend:** Django + Django REST Framework  
**Frontend:** React + Vite  
**Base arquitectónica:** Backend modular orientado a dominios, preparado para evolución progresiva hacia microservicios.

---

# 1. Objetivo

Definir la arquitectura técnica definitiva del backend de la plataforma **Fundación Tamborito + Museo Arqueológico Malibú**, utilizando **Django + Django REST Framework (DRF)** como tecnología principal.

El backend debe reemplazar progresivamente la lógica temporal actualmente manejada por el frontend mediante `localStorage`, contextos React y datos semilla, proporcionando:

- Persistencia real.
- Autenticación y autorización.
- Gestión de cursos.
- Inscripciones.
- Progreso académico.
- Evidencias.
- Carrito y órdenes.
- Pagos.
- Donaciones.
- Biblioteca digital.
- Gestión multimedia.
- Museo y colecciones.
- Notificaciones.
- Certificados.
- Reportes.
- Configuración.
- Auditoría.

El documento de implementación original establece que la solución debe partir de una arquitectura modular con límites de servicio claros y evolucionar hacia microservicios solamente cuando la carga, complejidad o necesidades operativas lo justifiquen.

---

# 2. Decisión arquitectónica definitiva

## 2.1 Decisión

La arquitectura definitiva será:

> **Monolito modular Django + Django REST Framework, orientado a dominios, con separación estricta de responsabilidades, comunicación mediante servicios internos y eventos de dominio, preparado para extracción progresiva hacia microservicios.**

No se recomienda iniciar desplegando cada dominio como un microservicio independiente.

La implementación inicial será:

```text
React + Vite
      │
      │ HTTPS / REST
      ▼
Nginx
      │
      ▼
Django + DRF
      │
      ├── Identity
      ├── Content
      ├── Courses
      ├── Learning
      ├── Commerce
      ├── Payments
      ├── Donations
      ├── Library
      ├── Media
      ├── Museum
      ├── Notifications
      ├── Certificates
      ├── Reports
      ├── Settings
      └── Audit
      │
      ├──────── PostgreSQL
      ├──────── Redis
      ├──────── RabbitMQ
      └──────── S3 / MinIO
```

La decisión conserva el enfoque recomendado en el documento fuente: empezar con una única API desplegable, separada internamente por dominios, y extraer posteriormente Payments, Media, Notifications, Reports u otros módulos cuando sea necesario.

---

# 3. Principios arquitectónicos

## 3.1 Modularidad por dominio

Cada dominio será una aplicación Django independiente dentro de `apps/`.

```text
identity
content
courses
learning
commerce
payments
donations
library
media
museum
notifications
certificates
reports
settings
audit
```

Cada aplicación será responsable de su propio:

- Modelo de datos.
- Lógica de negocio.
- Serializers.
- Views/ViewSets.
- URLs.
- Permisos.
- Servicios.
- Queries.
- Tasks.
- Eventos.
- Tests.

---

# 4. Principio de propiedad de datos

Cada dominio será propietario de sus modelos y tablas.

```text
Identity      → usuarios
Courses       → cursos
Learning      → inscripciones/progreso
Commerce      → carrito/órdenes
Payments      → pagos
Donations     → donaciones
Library       → recursos
Media         → archivos
Museum        → piezas/colecciones
Notifications → notificaciones
Certificates  → certificados
Reports       → modelos de lectura
Settings      → configuración
Audit         → auditoría
```

El resto de dominios no debe escribir directamente sobre tablas pertenecientes a otro dominio.

La comunicación entre dominios deberá realizarse mediante:

```text
1. Servicios internos
2. APIs internas
3. Eventos
```

El documento original establece explícitamente que cada servicio debe ser propietario de sus tablas y que los demás servicios deben comunicarse por API o eventos.

---

# 5. Stack tecnológico definitivo

## 5.1 Backend

| Capa | Tecnología |
|---|---|
| Lenguaje | Python 3.12+ |
| Framework | Django |
| API REST | Django REST Framework |
| ORM | Django ORM |
| Base de datos | PostgreSQL |
| Connection Pooling | PgBouncer |
| Cache | Redis |
| Jobs | Celery |
| Message Broker | RabbitMQ |
| Authentication | JWT |
| JWT | SimpleJWT |
| Authorization | Django Permissions + DRF Permissions |
| API Documentation | OpenAPI + drf-spectacular |
| File Storage | S3 / MinIO |
| S3 Client | boto3 |
| Django Storage | django-storages |
| Validation | DRF Serializers + Django Validators |
| Testing | pytest |
| Django Testing | pytest-django |
| API Testing | DRF APIClient |
| HTTP testing | pytest + requests |
| Logging | Python logging / structlog |
| Observability | OpenTelemetry |
| Reverse Proxy | Nginx |
| Containerización | Docker |
| Orquestación local | Docker Compose |
| CI/CD | GitHub Actions |
| Gestión de paquetes / entornos virtuales | uv |

---

# 5.1 Gestión de entornos virtuales y dependencias — uv

## Decisión

Se utilizará **[uv](https://docs.astral.sh/uv/)** como gestor único de
entornos virtuales y de dependencias de Python, en reemplazo del flujo
tradicional `pip` + `venv` + `requirements*.txt`.

```text
uv
├── Entorno virtual (.venv/)
├── Resolución y bloqueo de dependencias (uv.lock)
├── Instalación reproducible (uv sync)
└── Ejecución dentro del entorno (uv run)
```

## Motivación

- **Reproducibilidad real**: `uv.lock` fija versiones exactas (incluyendo
  hashes) de todo el árbol de dependencias, igual entre desarrolladores,
  CI y contenedores Docker.
- **Entorno virtual no versionado**: `.venv/` nunca se commitea; se
  reconstruye determinísticamente con `uv sync` a partir de
  `pyproject.toml` + `uv.lock`.
- **Velocidad**: instalación y resolución de dependencias significativamente
  más rápidas que `pip`, relevante tanto en desarrollo local como en
  builds de Docker/CI.
- **Un solo comando para todo**: `uv add`, `uv remove`, `uv run`, `uv sync`
  reemplazan la combinación manual de `python -m venv`, `pip install`,
  `pip freeze`.

## Reemplazo de `requirements/`

La estructura del repositorio (sección 8) ya no utiliza
`requirements/base.txt`, `requirements/development.txt` ni
`requirements/production.txt`. En su lugar:

```text
pyproject.toml   → declaración de dependencias del proyecto
uv.lock          → lockfile reproducible (se commitea)
.python-version  → versión de Python fijada (3.12)
```

Las dependencias de desarrollo/testing (`pytest`, `pytest-django`, `ruff`,
etc.) se declaran como *dev dependencies* dentro del mismo
`pyproject.toml`, no en un archivo separado.

## Uso

```bash
uv sync                    # crea/actualiza .venv según uv.lock
uv add <paquete>           # agrega dependencia de runtime
uv add --dev <paquete>     # agrega dependencia de desarrollo
uv run python manage.py <comando>
uv run pytest
```

## Docker

La imagen del contenedor (`docker/Dockerfile`) instala `uv` copiándolo
desde su imagen oficial y ejecuta `uv sync --frozen` contra el `uv.lock`
commiteado, garantizando que el entorno del contenedor sea idéntico al de
desarrollo local. No se utiliza `pip install -r requirements.txt` en
ningún punto del pipeline.

---

# 6. Infraestructura

```text
                           Internet
                              │
                              ▼
                         ┌─────────┐
                         │  Nginx  │
                         └────┬────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Django + DRF API │
                    └──────┬───────────┘
                           │
             ┌─────────────┼─────────────┐
             ▼             ▼             ▼
        PgBouncer        Redis        RabbitMQ
             │
             ▼
        PostgreSQL
             │             │             │
             │             │             ├── Celery Workers
             │             │             └── Domain Events
             │             │
             │             └── Cache / Jobs
             │
             └── Persistent Data

                              │
                              ▼
                        S3 / MinIO
                       File Storage
```

---

# 7. Arquitectura de capas dentro de Django

Cada dominio debe mantener una separación lógica:

```text
HTTP
 │
 ▼
DRF View / ViewSet
 │
 ▼
Serializer
 │
 ▼
Service
 │
 ▼
Domain / Models
 │
 ▼
Django ORM
 │
 ▼
PostgreSQL
```

Para consultas complejas:

```text
HTTP
 │
 ▼
ViewSet
 │
 ▼
Serializer
 │
 ▼
Selector / Query Service
 │
 ▼
Django ORM
 │
 ▼
PostgreSQL
```

Para operaciones asíncronas:

```text
Service
   │
   ▼
Domain Event
   │
   ▼
RabbitMQ
   │
   ▼
Celery Worker
   │
   ├── Email
   ├── Certificate
   ├── Notification
   ├── Report
   └── Other processing
```

---

# 8. Estructura definitiva del repositorio

```text
tamborito-backend/
│
├── config/
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   │
│   ├── urls.py
│   ├── api.py
│   ├── celery.py
│   ├── asgi.py
│   └── wsgi.py
│
├── apps/
│   │
│   ├── identity/
│   ├── content/
│   ├── courses/
│   ├── learning/
│   ├── commerce/
│   ├── payments/
│   ├── donations/
│   ├── library/
│   ├── media/
│   ├── museum/
│   ├── notifications/
│   ├── certificates/
│   ├── reports/
│   ├── settings/
│   └── audit/
│
├── infrastructure/
│   ├── storage/
│   ├── messaging/
│   ├── payments/
│   ├── email/
│   ├── observability/
│   └── database/
│       └── pgbouncer/
│
├── common/
│   ├── exceptions/
│   ├── permissions/
│   ├── pagination/
│   ├── middleware/
│   ├── authentication/
│   ├── responses/
│   └── utils/
│
├── tests/
│   ├── integration/
│   └── e2e/
│
├── docker/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pgbouncer/
│       ├── pgbouncer.ini
│       └── userlist.txt
│
├── manage.py
├── pytest.ini
├── pyproject.toml
├── uv.lock
├── .python-version
├── .env.example
├── .gitignore
└── README.md
```

`pyproject.toml` + `uv.lock` reemplazan `requirements/*.txt` como fuente
de dependencias (ver sección 5.1 — Gestión de entornos virtuales y
dependencias con uv).

---

# 9. Estructura interna de cada dominio

Ejemplo:

```text
apps/learning/
│
├── migrations/
│
├── models/
│   ├── __init__.py
│   ├── enrollment.py
│   ├── lesson_progress.py
│   └── evidence.py
│
├── serializers/
│   ├── __init__.py
│   ├── enrollment.py
│   ├── progress.py
│   └── evidence.py
│
├── views/
│   ├── __init__.py
│   ├── student.py
│   └── admin.py
│
├── services/
│   ├── enrollment_service.py
│   ├── progress_service.py
│   └── evidence_service.py
│
├── selectors/
│   ├── enrollment_selectors.py
│   └── progress_selectors.py
│
├── permissions.py
│
├── tasks.py
│
├── events.py
│
├── urls.py
│
├── admin.py
│
└── tests/
```

---

# 10. Regla de importación

La jerarquía recomendada es:

```text
Presentation
      │
      ▼
Application / Services
      │
      ▼
Domain / Models
      │
      ▼
Infrastructure
```

Dentro del monolito:

```text
common
   ↓
identity
   ↓
media
   ↓
courses
   ↓
learning
   ↓
commerce
   ↓
payments
```

Pero se debe evitar crear dependencias circulares.

Ejemplo incorrecto:

```python
# courses/services.py

from apps.learning.services import EnrollmentService
```

Preferible:

```text
Courses
   │
   ▼
course.published
   │
   ▼
Event Dispatcher
   │
   ▼
Learning
```

---

# 11. Jerarquía definitiva de dominios

```text
FOUNDATION
│
├── Identity
├── Content
├── Media
├── Settings
└── Audit
      │
      ▼
Courses
      │
      ▼
Learning
      │
      ▼
Commerce
      │
      ▼
Payments
      │
      ▼
Events
      │
      ├── Notifications
      ├── Certificates
      └── Reports

Identity ───────────► Donations
Identity + Media ───► Library
Identity + Media ───► Museum
```

---

# 12. Split 01 — Foundation

## Objetivo

Crear la infraestructura base del proyecto Django.

### Implementar

- Proyecto Django.
- DRF.
- Settings por ambiente.
- Variables de entorno.
- Logging.
- Exception handling.
- CORS.
- API versioning.
- Health check.
- OpenAPI.
- Middleware.
- Request ID.
- Seguridad HTTP.

### Dependencias

```text
Foundation
├── Django
├── DRF
├── PostgreSQL
├── Redis
└── OpenAPI
```

### Endpoint

```http
GET /api/v1/health
```

---

# 13. Split 02 — Identity

## Responsabilidad

Gestionar:

- Usuarios.
- Login.
- Registro.
- JWT.
- Refresh tokens.
- Perfil.
- Roles.
- Estado de cuenta.
- Organización.
- Password reset.
- Permisos.

Los roles mínimos definidos por el documento son:

```text
client
admin_foundation
admin_museum
super_admin
```



## Modelo

```text
User
├── id
├── name
├── email
├── password
├── role
├── organization_scope
├── status
├── phone
├── city
├── bio
├── created_at
└── updated_at
```

Django debe utilizar un **Custom User Model** desde el inicio.

```python
AUTH_USER_MODEL = "identity.User"
```

## Endpoints

```http
POST  /api/v1/auth/login
POST  /api/v1/auth/register
POST  /api/v1/auth/refresh
POST  /api/v1/auth/logout
GET   /api/v1/auth/me

PATCH /api/v1/users/me
PATCH /api/v1/users/me/password

GET   /api/v1/admin/users
PATCH /api/v1/admin/users/{id}/status
```

## Seguridad

```text
JWT Access Token
       │
       ▼
Django REST Framework
       │
       ▼
Authentication
       │
       ▼
Permission Classes
```

---

# 14. Split 03 — Content / CMS

## Responsabilidad

Gestionar páginas institucionales sin modificar código.

El documento contempla:

- Landing Ecosistema.
- Fundación Tamborito.
- Historia Fundación.
- Historia Museo.
- Contacto Museo.
- Política de privacidad.
- Secciones destacadas.

## Modelos

```text
Page
├── id
├── slug
├── organization
├── title
├── status
├── seo_title
├── seo_description
├── created_at
└── updated_at

PageSection
├── id
├── page
├── type
├── title
├── subtitle
├── body
├── media
├── position
└── metadata_json
```

## Endpoints

```http
GET    /api/v1/pages/{slug}

GET    /api/v1/admin/pages
POST   /api/v1/admin/pages
PATCH  /api/v1/admin/pages/{page_id}

POST   /api/v1/admin/pages/{page_id}/sections
PATCH  /api/v1/admin/page-sections/{section_id}
DELETE /api/v1/admin/page-sections/{section_id}
```

---

# 15. Split 04 — Media

## Responsabilidad

Centralizar:

- Imágenes.
- Videos.
- Audios.
- Documentos.
- Evidencias.
- Archivos institucionales.

## Modelos

```text
MediaAsset
├── id
├── owner_user
├── organization
├── file_name
├── original_name
├── mime_type
├── size
├── storage_path
├── public_url
├── visibility
├── checksum
└── created_at

MediaUsage
├── id
├── media
├── entity_type
├── entity_id
└── purpose
```

## Storage

```text
Development
      │
      ▼
MinIO

Production
      │
      ▼
Amazon S3 / S3 Compatible
```

## Librerías

```text
boto3
django-storages
```

## Endpoints

```http
POST   /api/v1/media/upload
GET    /api/v1/media/{media_id}
GET    /api/v1/media/{media_id}/signed-url
DELETE /api/v1/admin/media/{media_id}
```

Las evidencias estudiantiles y recursos privados deben permanecer protegidos mediante storage privado y URLs firmadas.

---

# 16. Split 05 — Courses

## Responsabilidad

Gestionar el catálogo académico.

## Modelos

```text
Course
├── id
├── slug
├── title
├── subtitle
├── description
├── category
├── language
├── duration_hours
├── price
├── is_free
├── status
├── featured
├── certificate_enabled
├── cover_media
├── instructor
├── organization
├── created_at
└── updated_at

CourseModule
├── id
├── course
├── title
├── description
└── position

Lesson
├── id
├── module
├── title
├── type
├── minutes
├── preview
├── summary
├── content
├── video_media
├── reading_resource
├── quiz_schema
├── assignment_instructions
├── upload_enabled
└── position

Instructor
├── id
├── name
├── title
├── avatar_media
└── bio

CourseResource
├── id
├── lesson
├── name
├── type
├── media
├── url
└── size_label
```

La estructura y reglas de cursos se derivan directamente del modelo propuesto en el documento fuente.

## Endpoints públicos

```http
GET /api/v1/courses
GET /api/v1/courses/{slug}
GET /api/v1/courses/{course_id}/preview
GET /api/v1/instructors/{instructor_id}
```

## Endpoints administrativos

```http
GET    /api/v1/admin/courses
POST   /api/v1/admin/courses
GET    /api/v1/admin/courses/{course_id}
PATCH  /api/v1/admin/courses/{course_id}
DELETE /api/v1/admin/courses/{course_id}

POST   /api/v1/admin/courses/{course_id}/publish
POST   /api/v1/admin/courses/{course_id}/archive

POST   /api/v1/admin/courses/{course_id}/modules
PATCH  /api/v1/admin/modules/{module_id}
DELETE /api/v1/admin/modules/{module_id}

POST   /api/v1/admin/modules/{module_id}/lessons
PATCH  /api/v1/admin/lessons/{lesson_id}
DELETE /api/v1/admin/lessons/{lesson_id}
```

---

# 17. Split 06 — Learning

## Responsabilidad

Gestionar:

- Inscripciones.
- Cursos del estudiante.
- Progreso.
- Última clase.
- Evidencias.
- Finalización.
- Notas.
- Asistencia.

## Modelos

```text
Enrollment
├── id
├── user
├── course
├── status
├── source
├── order
├── enrolled_at
├── completed_at
├── last_lesson
├── grade
└── attendance

LessonProgress
├── id
├── enrollment
├── lesson
├── status
├── completed_at
└── time_spent_seconds

Evidence
├── id
├── enrollment
├── lesson
├── file_media
├── file_name
├── file_type
├── file_size
├── description
├── status
├── feedback
├── submitted_at
└── reviewed_at
```



## Endpoints estudiante

```http
GET    /api/v1/student/dashboard
GET    /api/v1/student/enrollments
GET    /api/v1/student/courses/{course_id}
GET    /api/v1/student/courses/{course_id}/lessons/{lesson_id}

POST   /api/v1/student/courses/{course_id}/enroll-free

POST   /api/v1/student/courses/{course_id}/lessons/{lesson_id}/progress
DELETE /api/v1/student/courses/{course_id}/lessons/{lesson_id}/progress

POST   /api/v1/student/courses/{course_id}/lessons/{lesson_id}/evidence
```

## Endpoints administrativos

```http
GET   /api/v1/admin/enrollments
POST  /api/v1/admin/enrollments

GET   /api/v1/admin/students/{user_id}/enrollments
PATCH /api/v1/admin/enrollments/{enrollment_id}

GET   /api/v1/admin/evidences
GET   /api/v1/admin/evidences/{evidence_id}
PATCH /api/v1/admin/evidences/{evidence_id}/review
```

## Reglas

```text
Un estudiante
      │
      └──> una inscripción activa por curso

Curso gratuito
      │
      └──> inscripción directa

Curso pago
      │
      └──> payment.approved
                  │
                  ▼
              Enrollment
```

El porcentaje de progreso se calcula mediante clases completadas sobre el total de clases del curso. Al llegar al 100 %, debe dispararse la emisión del certificado cuando esté habilitada.

---

# 18. Split 07 — Commerce

## Responsabilidad

Gestionar:

- Carrito.
- Items.
- Órdenes.
- Totales.
- Estado de orden.
- Snapshot de precios.

## Modelos

```text
Cart
├── id
├── user
├── status
├── created_at
└── updated_at

CartItem
├── id
├── cart
├── course
├── price_snapshot
└── added_at

Order
├── id
├── order_number
├── user
├── subtotal
├── total
├── currency
├── payment_status
├── order_status
├── payment_method
├── transaction_reference
├── created_at
└── updated_at

OrderItem
├── id
├── order
├── course
├── title_snapshot
└── price_snapshot
```



## Endpoints

```http
GET    /api/v1/cart
POST   /api/v1/cart/items
DELETE /api/v1/cart/items/{course_id}
DELETE /api/v1/cart

POST   /api/v1/orders/checkout

GET    /api/v1/student/orders
GET    /api/v1/student/orders/{order_id}

GET    /api/v1/admin/orders
GET    /api/v1/admin/orders/{order_id}
PATCH  /api/v1/admin/orders/{order_id}
```

## Regla crítica

El precio de una orden se congela:

```text
Course.price
     │
     ▼
CartItem.price_snapshot
     │
     ▼
OrderItem.price_snapshot
```

---

# 19. Split 08 — Payments

## Responsabilidad

Integrar el proveedor de pagos y PSE.

El proveedor concreto de PSE queda como una decisión pendiente en el documento fuente; debe seleccionarse antes de implementar el flujo productivo.

## Modelos

```text
PaymentIntent
├── id
├── order
├── user
├── provider
├── method
├── amount
├── currency
├── status
├── provider_reference
├── redirect_url
├── created_at
└── updated_at

PaymentEvent
├── id
├── payment_intent
├── provider_event_id
├── event_type
├── payload_json
└── received_at
```

## Endpoints

```http
POST /api/v1/payments/intents
GET  /api/v1/payments/intents/{intent_id}

POST /api/v1/payments/webhooks/{provider}

GET /api/v1/payments/return
```

## Eventos

```text
payment.approved
payment.rejected
payment.pending
payment.expired
payment.refunded
```

## Regla fundamental

```text
Frontend
   │
   └── NO aprueba pagos

Provider
   │
   ▼
Webhook
   │
   ▼
Django
   │
   ▼
PaymentIntent
   │
   ▼
payment.approved
```

El frontend nunca debe decidir que una compra fue aprobada.

---

# 20. Split 09 — Donations

## Responsabilidad

Gestionar donaciones para:

```text
ecosystem
foundation
museum
```

## Modelo

```text
Donation
├── id
├── donor_user
├── donor_name
├── donor_email
├── organization_target
├── amount
├── currency
├── message
├── payment_intent
├── status
├── created_at
└── confirmed_at
```

## Endpoints

```http
POST /api/v1/donations

GET /api/v1/student/donations

GET /api/v1/admin/donations
GET /api/v1/admin/donations/{donation_id}
```

Una donación solamente debe contabilizarse como ingreso cuando el pago esté aprobado.

---

# 21. Split 10 — Library

## Responsabilidad

Gestionar biblioteca digital y recursos.

## Modelo

```text
LibraryResource
├── id
├── title
├── slug
├── description
├── category
├── type
├── access
├── organization
├── media
├── external_url
├── author
├── published_at
└── status

ResourceAccessLog
├── id
├── user
├── resource
├── action
└── created_at
```

## Endpoints

```http
GET    /api/v1/library/resources
GET    /api/v1/library/resources/{slug}

GET    /api/v1/library/resources/{resource_id}/download-url
POST   /api/v1/library/resources/{resource_id}/view-log

GET    /api/v1/admin/library/resources
POST   /api/v1/admin/library/resources
PATCH  /api/v1/admin/library/resources/{resource_id}
DELETE /api/v1/admin/library/resources/{resource_id}
```

## Access levels

```text
public
private
enrolled_only
purchased_only
```

Los recursos privados deben utilizar URLs firmadas o mecanismos controlados por backend.

---

# 22. Split 11 — Museum

## Responsabilidad

Gestionar:

- Colecciones.
- Piezas.
- Exposiciones.
- Imágenes.
- Información histórica.
- Material.
- Conservación.

## Modelos

```text
CollectionGroup
├── id
├── title
├── description
├── slug
├── status
└── position

MuseumPiece
├── id
├── collection_group
├── name
├── slug
├── material
├── history
├── description
├── conservation_status
├── origin_context
├── period_label
├── main_image_media
├── status
├── created_at
└── updated_at

MuseumExhibition
├── id
├── title
├── description
├── type
├── start_date
├── end_date
└── status
```



## Endpoints públicos

```http
GET /api/v1/museum/collection-groups
GET /api/v1/museum/pieces
GET /api/v1/museum/pieces/{slug}
GET /api/v1/museum/exhibitions
```

## Endpoints administrativos

```http
GET    /api/v1/admin/museum/collection-groups
POST   /api/v1/admin/museum/collection-groups
PATCH  /api/v1/admin/museum/collection-groups/{group_id}
DELETE /api/v1/admin/museum/collection-groups/{group_id}

GET    /api/v1/admin/museum/pieces
POST   /api/v1/admin/museum/pieces
PATCH  /api/v1/admin/museum/pieces/{piece_id}
DELETE /api/v1/admin/museum/pieces/{piece_id}
```

---

# 23. Split 12 — Notifications

## Modelo

```text
Notification
├── id
├── user
├── title
├── message
├── type
├── read
└── created_at
```

## Endpoints

```http
GET   /api/v1/notifications

PATCH /api/v1/notifications/{notification_id}/read
PATCH /api/v1/notifications/read-all

POST  /api/v1/admin/notifications
```

## Eventos consumidores

```text
enrollment.created
payment.approved
evidence.submitted
certificate.issued
donation.approved
account.status_changed
```



---

# 24. Split 13 — Certificates

## Modelo

```text
Certificate
├── id
├── user
├── course
├── code
├── issued_at
├── revoked_at
└── pdf_media
```

## Endpoints

```http
GET  /api/v1/student/certificates
GET  /api/v1/student/certificates/{certificate_id}

GET  /api/v1/certificates/verify/{code}

POST /api/v1/admin/certificates/{certificate_id}/revoke
```

## Flujo

```text
lesson.completed
      │
      ▼
Course progress = 100%
      │
      ▼
course.completed
      │
      ▼
Celery / Event Consumer
      │
      ▼
Certificate
      │
      ▼
certificate.issued
```

---

# 25. Split 14 — Reports

## Responsabilidad

Construir:

- Resumen financiero.
- Transacciones.
- Cursos vendidos.
- Ingresos por curso.
- Inscripciones.
- Donaciones.

## Arquitectura inicial

```text
PostgreSQL
     │
     ▼
Django ORM
     │
     ▼
Selectors / Query Services
     │
     ▼
Report API
```

## Evolución

Cuando el volumen lo justifique:

```text
Domain Tables
     │
     ▼
Events
     │
     ▼
Read Models
     │
     ▼
Reports
```

El documento recomienda read models o vistas materializadas si los reportes empiezan a impactar el rendimiento de las consultas transaccionales.

## Endpoints

```http
GET /api/v1/admin/reports/summary
GET /api/v1/admin/reports/transactions
GET /api/v1/admin/reports/course-revenue
GET /api/v1/admin/reports/enrollments
GET /api/v1/admin/reports/donations
```

---

# 26. Split 15 — Settings

## Responsabilidad

Gestionar configuración operativa:

```text
Platform configuration
Branding
Contact information
Feature flags
Operational settings
```

No debe permitir modificar desde frontend información sensible de infraestructura.

## Endpoints

```http
GET   /api/v1/admin/settings
PATCH /api/v1/admin/settings
```

---

# 27. Split 16 — Audit

## Modelo

```text
AuditLog
├── id
├── actor_user
├── organization
├── action
├── entity_type
├── entity_id
├── metadata
├── ip_address
├── user_agent
└── created_at
```

## Eventos auditables

```text
user.registered
course.created
course.updated
course.published
course.archived
enrollment.created
evidence.submitted
order.created
payment.approved
payment.refunded
donation.approved
certificate.issued
settings.updated
museum.piece.created
museum.piece.updated
```

---

# 28. Eventos de dominio

La arquitectura utilizará eventos para desacoplar dominios.

## Catálogo

```text
user.registered
course.published
enrollment.created
lesson.completed
course.completed
evidence.submitted
order.created
payment.approved
payment.rejected
payment.pending
payment.expired
payment.refunded
donation.approved
certificate.issued
```

Los eventos y sus productores/consumidores se basan en el documento de implementación.

---

# 29. RabbitMQ + Celery

## RabbitMQ

Será utilizado como broker de mensajería.

```text
Django
   │
   ▼
RabbitMQ
   │
   ├── notifications
   ├── certificates
   ├── reports
   ├── audit
   └── integrations
```

## Celery

Celery ejecutará procesos asíncronos:

```text
Email
PDF generation
Certificate generation
Notifications
Report aggregation
File processing
External payment operations
```

---

# 30. Ejemplo de flujo asíncrono

## Curso completado

```text
Student
   │
   ▼
POST /progress
   │
   ▼
Learning Service
   │
   ├── LessonProgress.completed
   │
   ▼
Course Progress = 100%
   │
   ▼
course.completed
   │
   ├──────────────┬───────────────┐
   ▼              ▼               ▼
Certificates Notifications      Reports
   │              │               │
   ▼              ▼               ▼
PDF              DB            Read Model
```

---

# 31. Base de datos

## PostgreSQL

Será la base de datos principal.

En la primera fase puede utilizarse una única base PostgreSQL con separación lógica por aplicaciones:

```text
identity.*
content.*
courses.*
learning.*
commerce.*
payments.*
donations.*
library.*
media.*
museum.*
notifications.*
certificates.*
reports.*
settings.*
audit.*
```

El documento original plantea precisamente PostgreSQL como base principal y la posibilidad de separar posteriormente cada dominio en bases independientes.

---

# 31.1 Connection Pooling — PgBouncer

## Motivación

PostgreSQL trata cada conexión como un proceso propio del sistema operativo, con un límite práctico bajo (`max_connections` por defecto ≈ 100). Django, sin pooling, abre una conexión nueva por request (o una persistente por worker si se usa `CONN_MAX_AGE`), y cada worker de Gunicorn/Uvicorn y cada worker de Celery mantiene las suyas.

Con múltiples workers web + múltiples workers Celery escalando horizontalmente, el número de conexiones concurrentes puede agotar el límite de PostgreSQL fácilmente, generando errores `too many connections` y degradación general del servicio.

## Decisión

Se incorpora **PgBouncer** como pooler dedicado, en **modo `transaction pooling`**, ubicado entre Django/Celery y PostgreSQL:

## Ubicación en la arquitectura

PgBouncer pertenece exclusivamente a la **capa de infraestructura**, no a ningún dominio de negocio. No debe modelarse como parte de `apps/` ni acoplarse a la lógica de ningún dominio Django:

```text
infrastructure/
├── storage/
├── messaging/
├── payments/
├── email/
├── observability/
└── database/
    └── pgbouncer/
```

Esto es consistente con el principio de modularidad por dominio (sección 3) y con el principio de propiedad de datos (sección 4): PgBouncer es un componente transversal que sirve a **todos** los dominios por igual, no es propiedad de ninguno.

Mantenerlo aislado en infraestructura permite escalar horizontalmente el número de workers de Django (Gunicorn) y de Celery sin que ese crecimiento se traduzca en un crecimiento equivalente de conexiones directas contra PostgreSQL. El límite de conexiones reales a la base de datos queda desacoplado del número de procesos de aplicación.

```text
Django (Gunicorn workers)
Celery (workers)
      │
      ▼
  PgBouncer
      │
      ▼
 PostgreSQL
```

PgBouncer mantiene un pool reducido y reutilizable de conexiones físicas hacia PostgreSQL, y multiplexa sobre él las conexiones lógicas que abren Django y Celery. Esto permite soportar cientos de conexiones lógicas concurrentes con un número mucho menor de conexiones reales a la base de datos.

## Configuración

```text
PgBouncer
├── pool_mode        = transaction
├── max_client_conn   = 500
├── default_pool_size = 20
└── reserve_pool_size = 5
```

En Django, la conexión apunta a PgBouncer en lugar de apuntar directamente a PostgreSQL:

```python
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "HOST": "pgbouncer",
        "PORT": 6432,
        "CONN_MAX_AGE": 0,
    }
}
```

`CONN_MAX_AGE = 0` es intencional: en modo `transaction pooling`, PgBouncer ya gestiona la reutilización de conexiones a nivel de infraestructura, por lo que Django no debe mantener conexiones persistentes propias (evita conflictos con `SET`, `prepared statements` y transacciones cruzadas entre requests).

## Restricciones del modo `transaction pooling`

No deben utilizarse en el mismo ciclo de conexión:

```text
Session-level advisory locks
Prepared statements no soportados por PgBouncer
LISTEN / NOTIFY
Cambios de sesión persistentes (SET search_path, etc.)
```

Estas restricciones deben tenerse en cuenta al diseñar `Services` que dependan de comportamiento de sesión de PostgreSQL.

## Infraestructura

PgBouncer se despliega como un contenedor adicional en `docker-compose.yml` y, en producción, como un servicio independiente delante de la instancia de PostgreSQL (o gestionado por el proveedor de base de datos, cuando el proveedor lo ofrezca de forma nativa).

```text
docker/
├── Dockerfile
├── docker-compose.yml
└── pgbouncer/
    ├── pgbouncer.ini
    └── userlist.txt
```

---

# 32. Django ORM

La persistencia será gestionada exclusivamente mediante Django ORM.

Ejemplo:

```python
class Course(models.Model):
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )
    is_free = models.BooleanField(default=False)
```

Las migraciones serán administradas por:

```bash
python manage.py makemigrations
python manage.py migrate
```

---

# 33. Regla de transacciones

Operaciones críticas deben utilizar:

```python
from django.db import transaction
```

Ejemplo:

```text
Checkout
   │
   ▼
transaction.atomic()
   │
   ├── Create Order
   ├── Create OrderItems
   ├── Create PaymentIntent
   └── Convert Cart
```

No se debe dejar una orden creada parcialmente.

---

# 34. API REST

La API pública será versionada:

```text
/api/v1/
```

## Estructura

```text
/api/v1/auth/*
/api/v1/users/*
/api/v1/pages/*
/api/v1/courses/*
/api/v1/student/*
/api/v1/cart/*
/api/v1/orders/*
/api/v1/payments/*
/api/v1/donations/*
/api/v1/library/*
/api/v1/media/*
/api/v1/museum/*
/api/v1/notifications/*
/api/v1/certificates/*
/api/v1/admin/*
```

---

# 35. DRF ViewSets

Para recursos CRUD:

```python
class CourseViewSet(ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
```

Para acciones específicas:

```python
@action(
    detail=True,
    methods=["post"],
    permission_classes=[IsAdminFoundation]
)
def publish(self, request, pk=None):
    ...
```

---

# 36. Serializers

Los serializers serán responsables de:

- Validación.
- Transformación JSON ↔ Python.
- Reglas de entrada.
- Representación de salida.

Ejemplo:

```text
CourseCreateSerializer
CourseUpdateSerializer
CourseListSerializer
CourseDetailSerializer
```

Evitar utilizar un único serializer gigante para todas las operaciones.

---

# 37. Services

La lógica de negocio compleja no debe colocarse dentro de `ViewSet`.

Incorrecto:

```python
class OrderViewSet:
    def create(self, request):
        # 150 líneas de lógica
```

Correcto:

```python
class OrderViewSet:
    def create(self, request):
        order = CheckoutService.execute(
            user=request.user,
            data=request.data
        )

        return Response(
            OrderSerializer(order).data
        )
```

---

# 38. Selectors

Los `selectors` se utilizarán para consultas complejas.

Ejemplo:

```text
apps/learning/selectors/
├── enrollment_selectors.py
├── progress_selectors.py
└── evidence_selectors.py
```

Esto permite evitar que los ViewSets acumulen consultas complejas.

---

# 39. Permisos

Utilizar DRF Permissions.

```text
IsAuthenticated
IsAdminUser
IsFoundationAdmin
IsMuseumAdmin
IsSuperAdmin
IsCourseOwner
IsEnrollmentOwner
OrganizationScopePermission
```

La separación de permisos debe considerar:

```text
role
+
organization_scope
```

El documento identifica como riesgo importante la claridad entre los roles Fundación y Museo y recomienda definir `organization_scope` desde Identity.

---

# 40. Seguridad

## Autenticación

```text
JWT Access Token
+
Refresh Token
```

Características:

- Access token de corta duración.
- Refresh token controlado.
- Revocación.
- Rotación cuando corresponda.

El documento permite JWT de corta duración + refresh token o sesiones HTTP-only; para esta arquitectura se selecciona JWT + refresh token.

## Password hashing

Django Password Hashers.

Se recomienda utilizar:

```text
Argon2
```

como opción preferente.

---

# 41. CORS

Configurar únicamente dominios autorizados:

```text
Development
http://localhost:5173

Production
https://dominio-produccion
```

Nunca:

```text
CORS_ALLOW_ALL_ORIGINS = True
```

en producción.

---

# 42. Archivos privados

Reglas:

```text
Evidencias
    ↓
Private S3

Documentos privados
    ↓
Private S3

Portadas públicas
    ↓
Public/CDN
```

Para acceso:

```text
GET /media/{id}/signed-url
```

El backend verifica primero:

```text
Authenticated?
       │
       ▼
Permission?
       │
       ▼
Organization?
       │
       ▼
Enrollment/Purchase?
       │
       ▼
Signed URL
```

---

# 43. API Documentation

Usar:

```text
drf-spectacular
```

Generar:

```text
OpenAPI schema
Swagger UI
Redoc
```

Endpoint:

```http
GET /api/schema/
GET /api/docs/
GET /api/redoc/
```

La documentación OpenAPI forma parte de la preparación técnica requerida por el documento original.

---

# 44. Testing

## Unit

```text
pytest
pytest-django
```

## API

```text
DRF APIClient
```

## E2E

```text
pytest
```

## Pirámide

```text
               E2E
              /   \
         Integration
          /       \
       Unit       Unit
```

Prioridad:

```text
Domain Services
Permissions
Serializers
Selectors
API endpoints
Payment webhooks
```

---

# 45. Tests críticos

## Identity

```text
Login
Register
Refresh
Inactive user
Role permissions
Organization scope
```

## Courses

```text
Create
Update
Publish
Archive
Slug uniqueness
Course validation
```

## Learning

```text
Enrollment
Duplicate enrollment
Progress
Course completion
Evidence upload
```

## Commerce

```text
Cart
Duplicate course
Checkout
Price snapshot
Order creation
```

## Payments

```text
Webhook signature
Idempotency
Approved
Rejected
Pending
Refunded
```

## Security

```text
Unauthorized access
Cross-organization access
Private media
Admin endpoints
```

---

# 46. Idempotencia

Los procesos críticos deben ser idempotentes.

Especialmente:

```text
Payment Webhooks
Certificate issuance
Notifications
Order processing
Donation confirmation
```

Ejemplo:

```text
payment.approved
      │
      ▼
provider_event_id
      │
      ▼
¿Ya existe?
 ┌────┴────┐
 │         │
Sí         No
 │         │
Skip       Process
```

Esto evita procesar dos veces el mismo webhook.

---

# 47. Observabilidad

## Logging

Formato estructurado:

```json
{
  "timestamp": "...",
  "level": "INFO",
  "request_id": "...",
  "user_id": "...",
  "service": "payments",
  "event": "payment.approved"
}
```

## OpenTelemetry

Instrumentar:

```text
HTTP
Database
Redis
Celery
RabbitMQ
External Payment Provider
S3
```

---

# 48. Redis

Redis tendrá tres responsabilidades principales:

```text
Redis
├── Cache
├── Rate limiting
└── Celery
```

Ejemplos de cache:

```text
courses:list:published
course:{slug}
museum:pieces
library:public
```

No debe utilizarse Redis como fuente principal de verdad.

---

# 49. API Gateway / BFF

En la primera fase, Nginx + Django serán suficientes.

```text
React
  │
  ▼
Nginx
  │
  ▼
Django REST Framework
```

No se recomienda agregar Kong, Traefik u otro API Gateway complejo hasta que exista una arquitectura distribuida real.

Cuando se extraigan microservicios:

```text
React
  │
  ▼
API Gateway
  │
  ├── Identity Service
  ├── Courses Service
  ├── Learning Service
  ├── Commerce Service
  ├── Payments Service
  ├── Media Service
  └── ...
```

---

# 50. Jerarquía de importaciones

## Nivel 0

```text
common
infrastructure
```

## Nivel 1

```text
identity
media
content
settings
audit
```

## Nivel 2

```text
courses
library
museum
```

## Nivel 3

```text
learning
```

## Nivel 4

```text
commerce
```

## Nivel 5

```text
payments
donations
```

## Nivel 6

```text
notifications
certificates
reports
```

La regla práctica será:

```text
Un dominio puede consumir contratos o servicios inferiores,
pero no debe importar directamente lógica interna de dominios superiores.
```

---

# 51. Comunicación entre dominios

## Síncrona

Usar cuando se necesita una respuesta inmediata:

```text
GET Course
GET User
GET Cart
GET Enrollment
POST Course
POST Order
```

## Asíncrona

Usar para:

```text
Payment approved
Certificate generation
Notification
Report update
Audit
Email
```

---

# 52. Fases definitivas de implementación

## Fase 0 — Foundation

### Tareas

1. Inicializar entorno virtual y gestión de dependencias con uv.
2. Crear proyecto Django.
3. Configurar DRF.
4. PostgreSQL.
5. PgBouncer.
6. Redis.
7. RabbitMQ.
8. Celery.
9. Docker.
10. OpenAPI.
11. Health check.
12. Logging.
13. CORS.
14. Configuración por ambiente.

### Entregables

```text
API
uv (entorno virtual + pyproject.toml + uv.lock)
PostgreSQL
PgBouncer
Redis
RabbitMQ
Celery
OpenAPI
Docker
Health Check
```

---

# 53. Fase 1 — Identity

### Tareas

```text
Login
Register
Logout
Refresh
Me
Profile
Password
Roles
Organization Scope
User status
```

### Criterios

- El frontend deja de autenticarse con `localStorage`.
- Usuarios inactivos no pueden iniciar sesión.
- Clientes no acceden a `/admin`.
- Administradores no acceden al campus como estudiantes.

Estos criterios derivan directamente de la fase de identidad del documento fuente.

---

# 54. Fase 2 — Courses

### Tareas

```text
Catalog
Course detail
Admin CRUD
Modules
Lessons
Resources
Publish
Archive
```

### Criterios

```text
/cursos
     ↓
API

/cursos/:slug
     ↓
API

/admin/cursos
     ↓
API
```

---

# 55. Fase 3 — Learning

### Tareas

```text
Free enrollment
Student dashboard
Progress
Last lesson
Evidence
Admin student view
```

### Criterios

- El progreso persiste.
- Evidencias reales.
- Administrador puede consultar progreso.
- Curso completado genera evento.

---

# 56. Fase 4 — Commerce + Payments

### Tareas

```text
Cart
Order
Checkout
PaymentIntent
PSE
Webhook
Order status
Enrollment activation
```

### Flujo

```text
Cart
 │
 ▼
Checkout
 │
 ▼
Order
 │
 ▼
PaymentIntent
 │
 ▼
PSE
 │
 ▼
Webhook
 │
 ▼
payment.approved
 │
 ├── Order completed
 └── Enrollment created
```

Este flujo coincide con la prioridad del documento: persistir carrito, crear orden, crear intento de pago, procesar webhook y habilitar el curso únicamente después de la aprobación.

---

# 57. Fase 5 — Media + Library

### Tareas

```text
Upload
S3/MinIO
Private resources
Signed URLs
Access logs
Library
```

---

# 58. Fase 6 — Museum

### Tareas

```text
Collection Groups
Museum Pieces
Images
Exhibitions
Publish
Archive
Museum Admin
```

El administrador Malibú debe poder administrar piezas sin afectar cursos de Fundación.

---

# 59. Fase 7 — Donations + Reports

### Tareas

```text
Donation
Payment
Receipt
Reports
Filters
Course revenue
Donation reports
```

---

# 60. Fase 8 — Notifications + Certificates + Audit + Settings

### Tareas

```text
Notifications
Certificates
Certificate verification
Audit
Settings
Operational configuration
```

Los criterios definidos incluyen emisión automática del certificado, auditoría de operaciones administrativas y eliminación de dependencias de `seedSettings`.

---

# 61. Backlog por prioridad

## Alta

```text
Authentication
Roles
Courses
Course Admin
Free Enrollment
Learning
Progress
Evidence
Orders
Payments
```

## Media

```text
Library
Certificates
Donations
Reports
Notifications
Settings
```

## Posterior

```text
CMS completo
Visual Editor
Advanced Reports
Class Analytics
Internal Messaging
Advanced Evaluations
Course Recommendations
```

Esta priorización está alineada con el backlog original del documento.

---

# 62. Cambios necesarios en frontend

El frontend debe abandonar progresivamente:

```text
AuthContext
PlatformContext
CartContext
platformSeed.js
localStorage como fuente de verdad
```

y pasar a:

```text
React
   │
   ▼
API Client
   │
   ▼
Django REST API
```

## Servicios frontend

```text
client/src/services/

apiClient.js
authService.js
courseService.js
learningService.js
cartService.js
orderService.js
paymentService.js
donationService.js
libraryService.js
mediaService.js
museumService.js
notificationService.js
reportService.js
settingsService.js
```

La estructura de servicios propuesta en el documento original puede conservarse, cambiando únicamente la implementación para consumir DRF.

---

# 63. Contrato de respuesta API

Se recomienda normalizar las respuestas.

## Success

```json
{
  "data": {},
  "meta": {}
}
```

## List

```json
{
  "data": [],
  "meta": {
    "count": 100,
    "page": 1,
    "page_size": 20
  }
}
```

## Error

```json
{
  "error": {
    "code": "COURSE_NOT_FOUND",
    "message": "Course not found",
    "details": {}
  }
}
```

---

# 64. Endpoints críticos finales

## Auth

```http
POST /api/v1/auth/login
POST /api/v1/auth/register
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me
```

## Courses

```http
GET   /api/v1/courses
GET   /api/v1/courses/{slug}
POST  /api/v1/admin/courses
PATCH /api/v1/admin/courses/{id}
```

## Learning

```http
GET  /api/v1/student/dashboard
GET  /api/v1/student/enrollments
POST /api/v1/student/courses/{id}/enroll-free
POST /api/v1/student/courses/{id}/lessons/{lesson_id}/progress
POST /api/v1/student/courses/{id}/lessons/{lesson_id}/evidence
```

## Commerce

```http
GET    /api/v1/cart
POST   /api/v1/cart/items
DELETE /api/v1/cart/items/{course_id}
POST   /api/v1/orders/checkout
GET    /api/v1/student/orders
```

## Payments

```http
POST /api/v1/payments/intents
GET  /api/v1/payments/intents/{id}
POST /api/v1/payments/webhooks/{provider}
```

## Library

```http
GET /api/v1/library/resources
GET /api/v1/library/resources/{slug}
GET /api/v1/library/resources/{id}/download-url
```

## Museum

```http
GET /api/v1/museum/collection-groups
GET /api/v1/museum/pieces
GET /api/v1/museum/pieces/{slug}
```

## Certificates

```http
GET /api/v1/student/certificates
GET /api/v1/certificates/verify/{code}
```

## Reports

```http
GET /api/v1/admin/reports/summary
GET /api/v1/admin/reports/transactions
GET /api/v1/admin/reports/course-revenue
GET /api/v1/admin/reports/donations
```

---

# 65. Arquitectura final

```text
                         ┌───────────────────┐
                         │   React + Vite    │
                         └─────────┬─────────┘
                                   │
                                   │ HTTPS
                                   ▼
                         ┌───────────────────┐
                         │       Nginx       │
                         └─────────┬─────────┘
                                   │
                                   ▼
              ┌─────────────────────────────────────────┐
              │              Django + DRF                │
              │                                         │
              │ Identity       Content       Courses    │
              │ Learning       Commerce      Payments   │
              │ Donations      Library       Media      │
              │ Museum         Notifications Certificates│
              │ Reports       Settings       Audit      │
              └──────────────┬──────────┬───────────────┘
                             │          │
                 ┌───────────┘          └────────────┐
                 ▼                                   ▼
        ┌─────────────────┐                  ┌───────────────┐
        │   PostgreSQL    │                  │     Redis     │
        │                 │                  │               │
        │ Persistent DB   │                  │ Cache / Jobs  │
        └─────────────────┘                  └───────┬───────┘
                                                     │
                                                     ▼
                                             ┌───────────────┐
                                             │    Celery     │
                                             └───────┬───────┘
                                                     │
                                                     ▼
                                             ┌───────────────┐
                                             │   RabbitMQ    │
                                             └───────┬───────┘
                                                     │
                           ┌─────────────────────────┼─────────────────┐
                           ▼                         ▼                 ▼
                     Notifications             Certificates        Reports


                    ┌─────────────────────────────────┐
                    │          S3 / MinIO              │
                    │                                   │
                    │ Images / Videos / Evidence       │
                    │ Documents / Certificates         │
                    └─────────────────────────────────┘
```

---

# 66. Evolución hacia microservicios

## Fase 1 — Modular Monolith

```text
Django
 │
 ├── Identity
 ├── Courses
 ├── Learning
 ├── Commerce
 ├── Payments
 ├── Media
 ├── Library
 ├── Museum
 ├── Notifications
 ├── Certificates
 ├── Reports
 └── ...
```

## Fase 2 — Extracción

Extraer primero:

```text
Payments
Media
Notifications
Reports
```

## Fase 3 — Distribución

```text
API Gateway
     │
     ├── Identity Service
     ├── Courses Service
     ├── Learning Service
     ├── Commerce Service
     ├── Payment Service
     ├── Donation Service
     ├── Library Service
     ├── Media Service
     ├── Museum Service
     ├── Notification Service
     ├── Certificate Service
     └── Report Service
```

---

# 67. Regla arquitectónica definitiva

> **Primero modularidad, después distribución.**

El backend debe ser diseñado desde el inicio para que cada aplicación Django tenga límites claros.

Pero no se deben introducir microservicios distribuidos hasta que exista una razón técnica u operativa real.

La estrategia será:

```text
Django Modular Monolith
          │
          ▼
Domain Boundaries
          │
          ▼
Internal Events
          │
          ▼
RabbitMQ
          │
          ▼
Selective Service Extraction
          │
          ▼
Microservices
```

Esta estrategia mantiene la recomendación central del documento fuente: definir correctamente límites de dominio, modelos y contratos API antes de distribuir físicamente los servicios.

---

# 68. Stack tecnológico definitivo — Resumen

```text
┌────────────────────────────────────────────┐
│                 BACKEND                    │
├────────────────────────────────────────────┤
│ Python 3.12+                               │
│ uv (entornos virtuales / dependencias)     │
│ Django                                     │
│ Django REST Framework                      │
│ Django ORM                                 │
├────────────────────────────────────────────┤
│ DATABASE                                   │
├────────────────────────────────────────────┤
│ PostgreSQL                                 │
│ PgBouncer (Connection Pooling)             │
├────────────────────────────────────────────┤
│ AUTH                                       │
├────────────────────────────────────────────┤
│ JWT                                        │
│ SimpleJWT                                  │
│ Django Permissions                         │
│ DRF Permissions                             │
├────────────────────────────────────────────┤
│ ASYNC                                      │
├────────────────────────────────────────────┤
│ Celery                                     │
│ RabbitMQ                                   │
│ Redis                                      │
├────────────────────────────────────────────┤
│ STORAGE                                    │
├────────────────────────────────────────────┤
│ S3 / MinIO                                 │
│ boto3                                      │
│ django-storages                            │
├────────────────────────────────────────────┤
│ API                                        │
├────────────────────────────────────────────┤
│ REST                                       │
│ OpenAPI                                    │
│ drf-spectacular                             │
├────────────────────────────────────────────┤
│ TESTING                                    │
├────────────────────────────────────────────┤
│ pytest                                     │
│ pytest-django                              │
│ DRF APIClient                              │
├────────────────────────────────────────────┤
│ OBSERVABILITY                              │
├────────────────────────────────────────────┤
│ Python logging / structlog                 │
│ OpenTelemetry                              │
├────────────────────────────────────────────┤
│ INFRASTRUCTURE                             │
├────────────────────────────────────────────┤
│ Docker                                     │
│ Docker Compose                             │
│ Nginx                                      │
│ GitHub Actions                             │
└────────────────────────────────────────────┘
```

---

# 69. Decisión final

La arquitectura backend definitiva de **Tamborito–Malibú** queda establecida como:

**Django + Django REST Framework + PostgreSQL + PgBouncer + Redis + Celery + RabbitMQ + S3/MinIO**, implementada inicialmente como **monolito modular orientado a dominios**, con **uv** como gestor de entornos virtuales y dependencias de Python.

La estructura deberá mantener separación entre:

```text
Identity
Content
Courses
Learning
Commerce
Payments
Donations
Library
Media
Museum
Notifications
Certificates
Reports
Settings
Audit
```

La comunicación síncrona utilizará REST/DRF y la comunicación asíncrona utilizará eventos mediante RabbitMQ/Celery.

La persistencia será gestionada mediante Django ORM y PostgreSQL. Los archivos serán manejados mediante S3/MinIO. La autenticación será JWT con refresh tokens. La autorización utilizará roles + `organization_scope`.

El sistema debe quedar preparado para evolucionar de:

```text
Django Modular Monolith
```

a:

```text
Microservices Architecture
```

sin necesidad de reescribir los dominios de negocio.

---

# 70. Criterios de aceptación globales

El backend estará listo para integración inicial cuando:

1. El frontend pueda iniciar sesión contra la API.
2. `/auth/me` devuelva el usuario autenticado.
3. Los usuarios inactivos no puedan acceder.
4. El catálogo de cursos provenga de PostgreSQL.
5. Los cursos puedan administrarse desde el panel.
6. Los estudiantes puedan inscribirse a cursos gratuitos.
7. Los cursos pagos solamente se habiliten después de pago aprobado.
8. El progreso se persista.
9. Las evidencias se almacenen como archivos reales.
10. El administrador pueda consultar estudiantes, cursos, progreso y evidencias.
11. El carrito y las órdenes sean persistentes.
12. Los pagos utilicen webhook como fuente de confirmación.
13. Las donaciones aprobadas aparezcan en reportes.
14. Los recursos privados estén protegidos.
15. El Museo tenga CRUD independiente.
16. Los certificados puedan verificarse mediante código.
17. Las notificaciones se generen mediante eventos.
18. Los reportes utilicen datos reales.
19. Las operaciones administrativas críticas queden auditadas.
20. La configuración operativa no dependa del frontend.
21. La API esté documentada mediante OpenAPI.
22. Los dominios puedan extraerse posteriormente como microservicios.
23. Las conexiones a PostgreSQL estén gestionadas mediante PgBouncer, evitando agotamiento de conexiones bajo carga concurrente de Django y Celery.

Estos criterios consolidan los criterios de aceptación definidos en el documento de implementación original.