import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters';

export default function StudentDashboard() {
  const { user } = useAuth();

  const {
    publishedCourses,
    getCourseById,
    getInstructorById,
    getUserEnrollments,
    getUserOrders,
    getUserCertificates,
    getUserNotifications,
    getCourseProgress,
    getNextLesson,
  } = usePlatform();

  const enrollments = getUserEnrollments(user.id);
  const orders = getUserOrders(user.id);
  const certificates = getUserCertificates(user.id);
  const notifications = getUserNotifications(user.id);

  const enrichedEnrollments = useMemo(
    () =>
      enrollments
        .map((enrollment) => {
          const course = getCourseById(
            enrollment.courseId,
          );

          if (!course) {
            return null;
          }

          return {
            enrollment,
            course,
            progress: getCourseProgress(
              user.id,
              course.id,
            ),
            nextLesson: getNextLesson(
              user.id,
              course.id,
            ),
            instructor: getInstructorById(
              course.instructorId,
            ),
          };
        })
        .filter(Boolean)
        .sort((first, second) => {
          if (
            first.enrollment.status ===
              'active' &&
            second.enrollment.status !==
              'active'
          ) {
            return -1;
          }

          return (
            second.progress.percentage -
            first.progress.percentage
          );
        }),
    [
      enrollments,
      getCourseById,
      getCourseProgress,
      getInstructorById,
      getNextLesson,
      user.id,
    ],
  );

  const activeCourses = enrichedEnrollments.filter(
    ({ enrollment }) =>
      enrollment.status === 'active',
  );

  const completedCourses =
    enrichedEnrollments.filter(
      ({ enrollment }) =>
        enrollment.status === 'completed',
    );

  const averageProgress = enrichedEnrollments.length
    ? Math.round(
        enrichedEnrollments.reduce(
          (total, item) =>
            total + item.progress.percentage,
          0,
        ) / enrichedEnrollments.length,
      )
    : 0;

  const enrolledCourseIds = new Set(
    enrollments.map(
      (enrollment) => enrollment.courseId,
    ),
  );

  const recommendedCourses = publishedCourses
    .filter(
      (course) => !enrolledCourseIds.has(course.id),
    )
    .slice(0, 3);

  const totalSpent = orders
    .filter(
      (order) => order.paymentStatus === 'approved',
    )
    .reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0,
    );

  const mainCourse =
    activeCourses[0] ?? completedCourses[0] ?? null;

  const stats = [
    {
      label: 'Cursos activos',
      value: activeCourses.length,
      icon: 'book',
      description: 'Rutas en desarrollo',
    },
    {
      label: 'Progreso promedio',
      value: `${averageProgress}%`,
      icon: 'chart',
      description: 'Entre todos tus cursos',
    },
    {
      label: 'Certificados',
      value: certificates.length,
      icon: 'certificate',
      description: 'Constancias disponibles',
    },
    {
      label: 'Inversión formativa',
      value: formatCurrency(totalSpent),
      icon: 'orders',
      description: 'Compras aprobadas',
    },
  ];

  return (
    <div className="student-dashboard-page">
      <section className="student-welcome-section">
        <div>
          <p className="student-page-eyebrow">
            Hola, {user.name.split(' ')[0]}
          </p>

          <h2>
            Continúa construyendo tu proceso cultural.
          </h2>

          <p>
            Revisa tus avances, continúa una clase o
            explora nuevas rutas de formación.
          </p>
        </div>

        <Link
          to="/cursos"
          className="platform-button platform-button-primary"
        >
          <PlatformIcon name="search" size={18} />
          Explorar cursos
        </Link>
      </section>

      <section className="student-stats-grid">
        {stats.map((stat) => (
          <article
            className="student-stat-card"
            key={stat.label}
          >
            <div>
              <PlatformIcon
                name={stat.icon}
                size={23}
              />
            </div>

            <span>
              <small>{stat.label}</small>
              <strong>{stat.value}</strong>
              <p>{stat.description}</p>
            </span>
          </article>
        ))}
      </section>

      {mainCourse ? (
        <section className="student-continue-section">
          <div className="student-section-heading">
            <div>
              <p className="student-page-eyebrow">
                Continuar aprendiendo
              </p>
              <h2>Retoma tu curso principal</h2>
            </div>

            <Link to="/campus/cursos">
              Ver todos mis cursos
              <PlatformIcon
                name="chevronRight"
                size={17}
              />
            </Link>
          </div>

          <article className="student-main-course-card">
            <div className="student-main-course-image">
              <img
                src={mainCourse.course.cover}
                alt={mainCourse.course.title}
              />

              <span>
                {mainCourse.course.category}
              </span>
            </div>

            <div className="student-main-course-content">
              <div>
                <span className="student-course-status">
                  {mainCourse.enrollment.status ===
                  'completed'
                    ? 'Curso completado'
                    : 'En progreso'}
                </span>

                <h3>{mainCourse.course.title}</h3>

                <p>{mainCourse.course.subtitle}</p>
              </div>

              <div className="student-main-progress">
                <div>
                  <span>Progreso general</span>
                  <strong>
                    {mainCourse.progress.percentage}%
                  </strong>
                </div>

                <div className="student-progress-track">
                  <span
                    style={{
                      width: `${mainCourse.progress.percentage}%`,
                    }}
                  />
                </div>

                <small>
                  {mainCourse.progress.completed} de{' '}
                  {mainCourse.progress.total} clases
                  completadas
                </small>
              </div>

              {mainCourse.nextLesson && (
                <div className="student-next-lesson">
                  <div>
                    <PlatformIcon
                      name="play"
                      size={22}
                    />
                  </div>

                  <span>
                    <small>Siguiente clase</small>
                    <strong>
                      {mainCourse.nextLesson.title}
                    </strong>
                    <p>
                      {
                        mainCourse.nextLesson
                          .moduleTitle
                      }{' '}
                      · {mainCourse.nextLesson.minutes} min
                    </p>
                  </span>
                </div>
              )}

              <div className="student-main-course-actions">
                {mainCourse.nextLesson ? (
                  <Link
                    to={`/campus/cursos/${mainCourse.course.id}/clase/${mainCourse.nextLesson.id}`}
                    className="platform-button platform-button-primary"
                  >
                    <PlatformIcon
                      name="play"
                      size={18}
                    />
                    Continuar clase
                  </Link>
                ) : (
                  <Link
                    to={`/campus/cursos/${mainCourse.course.id}`}
                    className="platform-button platform-button-primary"
                  >
                    Ver curso
                  </Link>
                )}

                <Link
                  to={`/campus/cursos/${mainCourse.course.id}`}
                  className="platform-button platform-button-ghost"
                >
                  Ver contenido
                </Link>
              </div>
            </div>
          </article>
        </section>
      ) : (
        <section className="student-empty-welcome">
          <div>
            <PlatformIcon name="book" size={42} />
          </div>

          <h2>Aún no tienes cursos vinculados.</h2>

          <p>
            Inscríbete en una ruta gratuita o compra un
            curso desde el catálogo.
          </p>

          <Link
            to="/cursos"
            className="platform-button platform-button-primary"
          >
            Explorar cursos
          </Link>
        </section>
      )}

      <section className="student-dashboard-columns">
        <div className="student-dashboard-column">
          <div className="student-section-heading">
            <div>
              <p className="student-page-eyebrow">
                Mis rutas
              </p>
              <h2>Cursos recientes</h2>
            </div>

            <Link to="/campus/cursos">
              Ver todos
            </Link>
          </div>

          <div className="student-compact-course-list">
            {enrichedEnrollments
              .slice(0, 4)
              .map(
                ({
                  enrollment,
                  course,
                  progress,
                  instructor,
                }) => (
                  <article
                    className="student-compact-course"
                    key={enrollment.id}
                  >
                    <img
                      src={course.cover}
                      alt={course.title}
                    />

                    <div>
                      <span>{course.category}</span>
                      <Link
                        to={`/campus/cursos/${course.id}`}
                      >
                        {course.title}
                      </Link>

                      <small>
                        {instructor?.name ??
                          'Equipo Tamborito'}
                      </small>

                      <div className="student-compact-progress">
                        <div>
                          <span
                            style={{
                              width: `${progress.percentage}%`,
                            }}
                          />
                        </div>

                        <strong>
                          {progress.percentage}%
                        </strong>
                      </div>
                    </div>
                  </article>
                ),
              )}
          </div>
        </div>

        <div className="student-dashboard-column">
          <div className="student-section-heading">
            <div>
              <p className="student-page-eyebrow">
                Actividad
              </p>
              <h2>Notificaciones recientes</h2>
            </div>
          </div>

          <div className="student-activity-list">
            {notifications.length === 0 ? (
              <div className="student-inline-empty">
                No hay actividad reciente.
              </div>
            ) : (
              notifications
                .slice(0, 5)
                .map((notification) => (
                  <article
                    key={notification.id}
                    className={[
                      'student-activity-item',
                      notification.read
                        ? ''
                        : 'unread',
                    ].join(' ')}
                  >
                    <div>
                      <PlatformIcon
                        name={
                          notification.type ===
                          'certificate'
                            ? 'certificate'
                            : notification.type ===
                                'order'
                              ? 'orders'
                              : 'book'
                        }
                        size={20}
                      />
                    </div>

                    <span>
                      <strong>
                        {notification.title}
                      </strong>
                      <p>{notification.message}</p>
                      <small>
                        {formatDate(
                          notification.createdAt,
                        )}
                      </small>
                    </span>
                  </article>
                ))
            )}
          </div>
        </div>
      </section>

      {recommendedCourses.length > 0 && (
        <section className="student-recommended-section">
          <div className="student-section-heading">
            <div>
              <p className="student-page-eyebrow">
                Recomendaciones
              </p>
              <h2>Continúa explorando</h2>
            </div>

            <Link to="/cursos">
              Ver catálogo
              <PlatformIcon
                name="chevronRight"
                size={17}
              />
            </Link>
          </div>

          <div className="student-recommended-grid">
            {recommendedCourses.map((course) => (
              <article
                className="student-recommended-card"
                key={course.id}
              >
                <Link to={`/cursos/${course.slug}`}>
                  <img
                    src={course.cover}
                    alt={course.title}
                  />
                </Link>

                <div>
                  <span>
                    {course.isFree
                      ? 'Gratis'
                      : formatCurrency(course.price)}
                  </span>

                  <Link to={`/cursos/${course.slug}`}>
                    {course.title}
                  </Link>

                  <p>{course.subtitle}</p>

                  <Link
                    to={`/cursos/${course.slug}`}
                    className="student-text-link"
                  >
                    Ver curso
                    <PlatformIcon
                      name="chevronRight"
                      size={16}
                    />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}