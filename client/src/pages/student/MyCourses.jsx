import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';

const statusOptions = [
  {
    value: 'all',
    label: 'Todos',
  },
  {
    value: 'active',
    label: 'En progreso',
  },
  {
    value: 'completed',
    label: 'Finalizados',
  },
];

export default function MyCourses() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const { user } = useAuth();

  const {
    getCourseById,
    getInstructorById,
    getUserEnrollments,
    getCourseProgress,
    getNextLesson,
  } = usePlatform();

  const enrollments = getUserEnrollments(user.id);

  const courses = useMemo(
    () =>
      enrollments
        .map((enrollment) => {
          const course = getCourseById(enrollment.courseId);

          if (!course) {
            return null;
          }

          return {
            enrollment,
            course,
            progress: getCourseProgress(user.id, course.id),
            nextLesson: getNextLesson(user.id, course.id),
            instructor: getInstructorById(course.instructorId),
          };
        })
        .filter(Boolean),
    [
      enrollments,
      getCourseById,
      getCourseProgress,
      getInstructorById,
      getNextLesson,
      user.id,
    ],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return courses.filter(({ enrollment, course }) => {
      const matchesStatus =
        status === 'all' || enrollment.status === status;

      const matchesQuery =
        !normalizedQuery ||
        [
          course.title,
          course.subtitle,
          course.category,
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [courses, query, status]);

  const counts = {
    all: courses.length,
    active: courses.filter(
      ({ enrollment }) => enrollment.status === 'active',
    ).length,
    completed: courses.filter(
      ({ enrollment }) => enrollment.status === 'completed',
    ).length,
  };

  return (
    <div className="student-my-courses-page">
      <section className="student-page-header">
        <div>
          <p className="student-page-eyebrow">Cursos</p>

          <h2>Mis cursos</h2>

          <p>
            Consulta tus rutas activas, progreso, siguiente actividad y
            certificados.
          </p>
        </div>

        <Link to="/cursos" className="platform-button platform-button-primary">
          <PlatformIcon name="plus" size={18} />
          Explorar nuevos cursos
        </Link>
      </section>

      <section className="student-course-toolbar">
        <div className="student-course-tabs">
          {statusOptions.map((option) => (
            <button
              type="button"
              key={option.value}
              className={status === option.value ? 'active' : ''}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
              <span>{counts[option.value]}</span>
            </button>
          ))}
        </div>

        <div className="student-course-search">
          <PlatformIcon name="search" size={19} />

          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar entre mis cursos"
          />
        </div>
      </section>

      {filteredCourses.length === 0 ? (
        <section className="student-empty-state">
          <div>
            <PlatformIcon name="book" size={44} />
          </div>

          <h2>No hay cursos para mostrar.</h2>

          <p>
            Cambia el filtro o inscríbete en una nueva ruta desde el catálogo.
          </p>

          <Link to="/cursos" className="platform-button platform-button-primary">
            Ver catálogo
          </Link>
        </section>
      ) : (
        <section className="student-course-library-grid">
          {filteredCourses.map(
            ({
              enrollment,
              course,
              progress,
              nextLesson,
              instructor,
            }) => (
              <article className="student-library-course-card" key={enrollment.id}>
                <Link
                  to={`/campus/cursos/${course.id}`}
                  className="student-library-course-cover"
                >
                  <img src={course.cover} alt={course.title} />

                  <span
                    className={[
                      'student-library-status',
                      enrollment.status,
                    ].join(' ')}
                  >
                    {enrollment.status === 'completed'
                      ? 'Finalizado'
                      : 'En progreso'}
                  </span>
                </Link>

                <div className="student-library-course-content">
                  <Link
                    to={`/campus/cursos/${course.id}`}
                    className="student-library-title"
                  >
                    {course.title}
                  </Link>

                  <p>{course.subtitle}</p>

                  <div className="student-library-instructor">
                    <img src={instructor?.avatar} alt={instructor?.name} />

                    <span>{instructor?.name ?? 'Equipo Tamborito'}</span>
                  </div>

                  <div className="student-library-progress">
                    <div>
                      <span>Progreso</span>
                      <strong>{progress.percentage}%</strong>
                    </div>

                    <div className="student-progress-track">
                      <span
                        style={{
                          width: `${progress.percentage}%`,
                        }}
                      />
                    </div>

                    <small>
                      {progress.completed} de {progress.total} avances
                      registrados
                    </small>
                  </div>

                  {nextLesson && enrollment.status !== 'completed' && (
                    <div className="student-library-next">
                      <PlatformIcon name="play" size={18} />

                      <span>
                        <small>Siguiente clase</small>
                        <strong>{nextLesson.title}</strong>
                      </span>
                    </div>
                  )}

                  <div className="student-library-actions">
                    {nextLesson && enrollment.status !== 'completed' ? (
                      <Link
                        to={`/campus/cursos/${course.id}/clase/${nextLesson.id}`}
                        className="platform-button platform-button-primary"
                      >
                        Continuar
                      </Link>
                    ) : (
                      <Link
                        to={`/campus/cursos/${course.id}`}
                        className="platform-button platform-button-primary"
                      >
                        Ver curso
                      </Link>
                    )}

                    <Link
                      to={`/campus/cursos/${course.id}`}
                      className="platform-button platform-button-ghost"
                    >
                      Contenido
                    </Link>
                  </div>
                </div>
              </article>
            ),
          )}
        </section>
      )}
    </div>
  );
}