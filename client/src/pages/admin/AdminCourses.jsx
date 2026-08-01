import {
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatCurrency,
  formatDate,
  getCourseLessonCount,
} from '../../utils/formatters';

const statusLabels = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
};

export default function AdminCourses() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [category, setCategory] =
    useState('all');

  const {
    courses,
    enrollments,
    getInstructorById,
    updateCourse,
    deleteCourse,
  } = usePlatform();

  const categories = useMemo(
    () => [
      'all',
      ...new Set(
        courses.map(
          (course) => course.category,
        ),
      ),
    ],
    [courses],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return courses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        [
          course.title,
          course.category,
          course.level,
          course.description,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        status === 'all' ||
        course.status === status;

      const matchesCategory =
        category === 'all' ||
        course.category === category;

      return (
        matchesQuery &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [courses, query, status, category]);

  function getStudentCount(courseId) {
    return enrollments.filter(
      (enrollment) =>
        enrollment.courseId === courseId,
    ).length;
  }

  function togglePublication(course) {
    updateCourse(course.id, {
      status:
        course.status === 'published'
          ? 'draft'
          : 'published',
    });
  }

  function archiveCourse(course) {
    updateCourse(course.id, {
      status:
        course.status === 'archived'
          ? 'draft'
          : 'archived',
    });
  }

  function removeCourse(course) {
    const accepted = window.confirm(
      `¿Eliminar permanentemente "${course.title}"? También se eliminarán sus inscripciones.`,
    );

    if (!accepted) {
      return;
    }

    deleteCourse(course.id);
  }

  const summary = {
    total: courses.length,
    published: courses.filter(
      (course) => course.status === 'published',
    ).length,
    drafts: courses.filter(
      (course) => course.status === 'draft',
    ).length,
    archived: courses.filter(
      (course) => course.status === 'archived',
    ).length,
  };

  return (
    <div className="admin-courses-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">
            Oferta formativa
          </p>

          <h2>Administración de cursos</h2>

          <p>
            Crea, publica y organiza cursos,
            módulos, clases, recursos,
            evaluaciones y precios.
          </p>
        </div>

        <Link
          to="/admin/cursos/nuevo"
          className="platform-button platform-button-primary"
        >
          <PlatformIcon name="plus" size={18} />
          Crear curso
        </Link>
      </section>

      <section className="admin-course-summary-grid">
        <article>
          <span>Total</span>
          <strong>{summary.total}</strong>
        </article>

        <article>
          <span>Publicados</span>
          <strong>{summary.published}</strong>
        </article>

        <article>
          <span>Borradores</span>
          <strong>{summary.drafts}</strong>
        </article>

        <article>
          <span>Archivados</span>
          <strong>{summary.archived}</strong>
        </article>
      </section>

      <section className="admin-toolbar">
        <div className="admin-search-control">
          <PlatformIcon
            name="search"
            size={19}
          />

          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Buscar cursos"
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value)
          }
        >
          <option value="all">
            Todos los estados
          </option>
          <option value="published">
            Publicados
          </option>
          <option value="draft">
            Borradores
          </option>
          <option value="archived">
            Archivados
          </option>
        </select>

        <select
          value={category}
          onChange={(event) =>
            setCategory(event.target.value)
          }
        >
          <option value="all">
            Todas las categorías
          </option>

          {categories
            .filter((item) => item !== 'all')
            .map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
        </select>

        <span className="admin-results-count">
          {filteredCourses.length} resultados
        </span>
      </section>

      {filteredCourses.length === 0 ? (
        <section className="admin-empty-state">
          <PlatformIcon
            name="search"
            size={42}
          />

          <h3>No hay cursos para mostrar.</h3>

          <p>
            Cambia los filtros o crea una nueva
            ruta formativa.
          </p>
        </section>
      ) : (
        <section className="admin-course-table">
          <div className="admin-course-table-head">
            <span>Curso</span>
            <span>Contenido</span>
            <span>Estudiantes</span>
            <span>Precio</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>

          {filteredCourses.map((course) => {
            const instructor =
              getInstructorById(
                course.instructorId,
              );

            return (
              <article
                className="admin-course-table-row"
                key={course.id}
              >
                <div className="admin-course-cell-main">
                  <img
                    src={course.cover}
                    alt={course.title}
                  />

                  <span>
                    <strong>{course.title}</strong>
                    <small>
                      {course.category} ·{' '}
                      {course.level}
                    </small>
                    <small>
                      Actualizado{' '}
                      {formatDate(
                        course.updatedAt,
                      )}
                    </small>
                  </span>
                </div>

                <div className="admin-course-cell">
                  <strong>
                    {course.modules.length} módulos
                  </strong>
                  <span>
                    {getCourseLessonCount(course)}{' '}
                    clases
                  </span>
                </div>

                <div className="admin-course-cell">
                  <strong>
                    {getStudentCount(course.id)}
                  </strong>
                  <span>Inscritos</span>
                </div>

                <div className="admin-course-cell">
                  <strong>
                    {course.isFree
                      ? 'Gratis'
                      : formatCurrency(
                          course.price,
                        )}
                  </strong>
                  <span>
                    {instructor?.name ??
                      'Sin instructor'}
                  </span>
                </div>

                <div className="admin-course-cell">
                  <span
                    className={[
                      'admin-status-badge',
                      course.status,
                    ].join(' ')}
                  >
                    {statusLabels[course.status]}
                  </span>
                </div>

                <div className="admin-course-actions">
                  <Link
                    to={`/admin/cursos/${course.id}/editar`}
                    title="Editar curso"
                  >
                    <PlatformIcon
                      name="edit"
                      size={18}
                    />
                  </Link>

                  <button
                    type="button"
                    title={
                      course.status ===
                      'published'
                        ? 'Pasar a borrador'
                        : 'Publicar'
                    }
                    onClick={() =>
                      togglePublication(course)
                    }
                  >
                    <PlatformIcon
                      name={
                        course.status ===
                        'published'
                          ? 'lock'
                          : 'external'
                      }
                      size={18}
                    />
                  </button>

                  <button
                    type="button"
                    title={
                      course.status ===
                      'archived'
                        ? 'Restaurar'
                        : 'Archivar'
                    }
                    onClick={() =>
                      archiveCourse(course)
                    }
                  >
                    <PlatformIcon
                      name="orders"
                      size={18}
                    />
                  </button>

                  <button
                    type="button"
                    className="danger"
                    title="Eliminar"
                    onClick={() =>
                      removeCourse(course)
                    }
                  >
                    <PlatformIcon
                      name="trash"
                      size={18}
                    />
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}