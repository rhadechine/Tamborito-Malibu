import { useMemo, useState } from 'react';
import {
  Link,
  Navigate,
  useParams,
} from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatDate,
  getCourseDuration,
  getCourseLessonCount,
} from '../../utils/formatters';

const lessonTypeLabels = {
  video: 'Video',
  reading: 'Lectura',
  quiz: 'Evaluación',
  practice: 'Práctica',
  assignment: 'Actividad',
};

export default function CourseWorkspace() {
  const { courseId } = useParams();

  const [openModules, setOpenModules] = useState([
    0,
  ]);

  const { user } = useAuth();

  const {
    getCourseById,
    getInstructorById,
    getEnrollment,
    getCourseProgress,
    getNextLesson,
    getUserCertificates,
  } = usePlatform();

  const course = getCourseById(courseId);
  const enrollment = getEnrollment(
    user.id,
    courseId,
  );

  const instructor = course
    ? getInstructorById(course.instructorId)
    : null;

  const progress = course
    ? getCourseProgress(user.id, course.id)
    : null;

  const nextLesson = course
    ? getNextLesson(user.id, course.id)
    : null;

  const certificate = getUserCertificates(
    user.id,
  ).find(
    (item) => item.courseId === courseId,
  );

  const completedLessons = useMemo(
    () => new Set(enrollment?.completedLessons ?? []),
    [enrollment],
  );

  if (!course || !enrollment) {
    return (
      <Navigate to="/campus/cursos" replace />
    );
  }

  const totalLessons = getCourseLessonCount(course);
  const duration = getCourseDuration(course);

  function toggleModule(index) {
    setOpenModules((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index],
    );
  }

  return (
    <div className="student-course-workspace">
      <nav className="student-workspace-breadcrumb">
        <Link to="/campus/cursos">
          Mis cursos
        </Link>

        <PlatformIcon
          name="chevronRight"
          size={15}
        />

        <span>{course.title}</span>
      </nav>

      <section className="student-workspace-hero">
        <div className="student-workspace-cover">
          <img src={course.cover} alt={course.title} />
        </div>

        <div className="student-workspace-copy">
          <div className="student-workspace-badges">
            <span>{course.category}</span>
            <span>{course.isFree ? 'Gratis' : 'Pago'}</span>
            <span>
              {enrollment.status === 'completed'
                ? 'Finalizado'
                : 'En progreso'}
            </span>
          </div>

          <h2>{course.title}</h2>

          <p>{course.subtitle}</p>

          <div className="student-workspace-instructor">
            <img
              src={instructor?.avatar}
              alt={instructor?.name}
            />

            <span>
              <small>Instructor</small>
              <strong>
                {instructor?.name ??
                  'Equipo Tamborito'}
              </strong>
            </span>
          </div>

          <div className="student-workspace-progress">
            <div>
              <span>Progreso del curso</span>
              <strong>
                {progress.percentage}%
              </strong>
            </div>

            <div className="student-progress-track">
              <span
                style={{
                  width: `${progress.percentage}%`,
                }}
              />
            </div>

            <small>
              {progress.completed} de {progress.total}{' '}
              avances registrados
            </small>
          </div>

          {nextLesson &&
          enrollment.status !== 'completed' ? (
            <Link
              to={`/campus/cursos/${course.id}/clase/${nextLesson.id}`}
              className="platform-button platform-button-primary"
            >
              <PlatformIcon name="play" size={18} />
              Continuar: {nextLesson.title}
            </Link>
          ) : certificate ? (
            <Link
              to="/campus/certificados"
              className="platform-button platform-button-primary"
            >
              <PlatformIcon
                name="certificate"
                size={18}
              />
              Ver certificado
            </Link>
          ) : null}
        </div>
      </section>

      <section className="student-workspace-summary">
        <article>
          <div>
            <PlatformIcon name="lessons" size={22} />
          </div>

          <span>
            <strong>{totalLessons}</strong>
            <small>Clases</small>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon name="clock" size={22} />
          </div>

          <span>
            <strong>{duration}</strong>
            <small>Duración total</small>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon name="chart" size={22} />
          </div>

          <span>
            <strong>
              {enrollment.grade ?? 'Pendiente'}
            </strong>
            <small>Calificación</small>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon
              name="certificate"
              size={22}
            />
          </div>

          <span>
            <strong>
              {certificate ? 'Disponible' : 'Pendiente'}
            </strong>
            <small>Certificado</small>
          </span>
        </article>
      </section>

      <div className="student-workspace-layout">
        <section className="student-workspace-content">
          <div className="student-section-heading">
            <div>
              <p className="student-page-eyebrow">
                Ruta de aprendizaje
              </p>

              <h2>Contenido del curso</h2>
            </div>

            <button
              type="button"
              onClick={() =>
                setOpenModules(
                  openModules.length ===
                    course.modules.length
                    ? []
                    : course.modules.map(
                        (_, index) => index,
                      ),
                )
              }
            >
              {openModules.length ===
              course.modules.length
                ? 'Contraer módulos'
                : 'Expandir módulos'}
            </button>
          </div>

          <div className="student-workspace-modules">
            {course.modules.map(
              (module, moduleIndex) => {
                const isOpen =
                  openModules.includes(moduleIndex);

                const moduleCompleted =
                  module.lessons.filter((lesson) =>
                    completedLessons.has(lesson.id),
                  ).length;

                return (
                  <article
                    className="student-workspace-module"
                    key={module.id}
                  >
                    <button
                      type="button"
                      className="student-workspace-module-header"
                      onClick={() =>
                        toggleModule(moduleIndex)
                      }
                    >
                      <span className="student-module-number">
                        {String(
                          moduleIndex + 1,
                        ).padStart(2, '0')}
                      </span>

                      <span className="student-module-title">
                        <strong>{module.title}</strong>
                        <small>
                          {moduleCompleted} de{' '}
                          {module.lessons.length} avances
                          registrados
                        </small>
                      </span>

                      <div className="student-module-progress-mini">
                        <span>
                          {Math.round(
                            (moduleCompleted /
                              module.lessons.length) *
                              100,
                          )}
                          %
                        </span>

                        <PlatformIcon
                          name={
                            isOpen
                              ? 'chevronDown'
                              : 'chevronRight'
                          }
                          size={20}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="student-workspace-lessons">
                        <p className="student-module-description">
                          {module.description}
                        </p>

                        {module.lessons.map(
                          (lesson, lessonIndex) => {
                            const completed =
                              completedLessons.has(
                                lesson.id,
                              );

                            return (
                              <Link
                                key={lesson.id}
                                to={`/campus/cursos/${course.id}/clase/${lesson.id}`}
                                className={[
                                  'student-workspace-lesson',
                                  completed
                                    ? 'completed'
                                    : '',
                                  enrollment.lastLessonId ===
                                  lesson.id
                                    ? 'current'
                                    : '',
                                ].join(' ')}
                              >
                                <span className="student-lesson-status">
                                  {completed ? (
                                    <PlatformIcon
                                      name="check"
                                      size={17}
                                    />
                                  ) : (
                                    lessonIndex + 1
                                  )}
                                </span>

                                <span className="student-lesson-copy">
                                  <strong>
                                    {lesson.title}
                                  </strong>

                                  <small>
                                    {
                                      lessonTypeLabels[
                                        lesson.type
                                      ]
                                    }{' '}
                                    · {lesson.minutes} min
                                  </small>
                                </span>

                                {enrollment.lastLessonId ===
                                  lesson.id &&
                                  !completed && (
                                    <span className="student-current-label">
                                      Continuar
                                    </span>
                                  )}

                                <PlatformIcon
                                  name="chevronRight"
                                  size={17}
                                />
                              </Link>
                            );
                          },
                        )}
                      </div>
                    )}
                  </article>
                );
              },
            )}
          </div>
        </section>

        <aside className="student-workspace-sidebar">
          <section>
            <h3>Información del curso</h3>

            <ul>
              <li>
                <span>Inscripción</span>
                <strong>
                  {formatDate(
                    enrollment.enrolledAt,
                  )}
                </strong>
              </li>

              <li>
                <span>Duración</span>
                <strong>{course.durationLabel}</strong>
              </li>

              <li>
                <span>Acceso</span>
                <strong>{course.isFree ? 'Gratuito' : 'Pago'}</strong>
              </li>

              <li>
                <span>Estado</span>
                <strong>
                  {enrollment.status ===
                  'completed'
                    ? 'Finalizado'
                    : 'Activo'}
                </strong>
              </li>
            </ul>
          </section>

          <section>
            <h3>¿Qué aprenderás?</h3>

            <ul className="student-workspace-outcomes">
              {course.learningOutcomes.map(
                (outcome) => (
                  <li key={outcome}>
                    <PlatformIcon
                      name="check"
                      size={17}
                    />
                    <span>{outcome}</span>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section className="student-support-card">
            <PlatformIcon
              name="user"
              size={28}
            />

            <h3>¿Necesitas ayuda?</h3>

            <p>
              Contacta al equipo pedagógico si tienes
              dudas sobre clases, actividades o
              evaluaciones.
            </p>

            <Link
              to="/inscripcion"
              className="platform-button platform-button-dark"
            >
              Solicitar soporte
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}