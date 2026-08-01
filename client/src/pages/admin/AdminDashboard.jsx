import { Link } from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters';

const paymentLabels = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};

export default function AdminDashboard() {
  const { users } = useAuth();

  const {
    courses,
    enrollments,
    orders,
    certificates,
    getCourseById,
  } = usePlatform();

  const students = users.filter(
    (user) => user.role === 'client',
  );

  const publishedCourses = courses.filter(
    (course) => course.status === 'published',
  );

  const approvedOrders = orders.filter(
    (order) => order.paymentStatus === 'approved',
  );

  const totalRevenue = approvedOrders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0,
  );

  const activeEnrollments = enrollments.filter(
    (enrollment) => enrollment.status === 'active',
  );

  const completedEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.status === 'completed',
  );

  const completionRate = enrollments.length
    ? Math.round(
        (completedEnrollments.length /
          enrollments.length) *
          100,
      )
    : 0;

  const recentOrders = [...orders]
    .sort(
      (first, second) =>
        new Date(second.createdAt) -
        new Date(first.createdAt),
    )
    .slice(0, 5);

  const recentEnrollments = [...enrollments]
    .sort(
      (first, second) =>
        new Date(second.enrolledAt) -
        new Date(first.enrolledAt),
    )
    .slice(0, 5);

  const coursePerformance = courses
    .map((course) => {
      const courseEnrollments = enrollments.filter(
        (enrollment) =>
          enrollment.courseId === course.id,
      );

      const completed = courseEnrollments.filter(
        (enrollment) =>
          enrollment.status === 'completed',
      ).length;

      return {
        course,
        enrollments: courseEnrollments.length,
        completionRate: courseEnrollments.length
          ? Math.round(
              (completed /
                courseEnrollments.length) *
                100,
            )
          : 0,
      };
    })
    .sort(
      (first, second) =>
        second.enrollments - first.enrollments,
    )
    .slice(0, 5);

  const stats = [
    {
      label: 'Cursos publicados',
      value: publishedCourses.length,
      icon: 'book',
      trend: `${courses.length} registrados`,
      className: 'courses',
    },
    {
      label: 'Estudiantes',
      value: students.length,
      icon: 'users',
      trend: `${
        students.filter(
          (student) =>
            student.status === 'active',
        ).length
      } activos`,
      className: 'students',
    },
    {
      label: 'Inscripciones activas',
      value: activeEnrollments.length,
      icon: 'lessons',
      trend: `${completionRate}% finalización`,
      className: 'enrollments',
    },
    {
      label: 'Ingresos aprobados',
      value: formatCurrency(totalRevenue),
      icon: 'orders',
      trend: `${approvedOrders.length} ventas`,
      className: 'revenue',
    },
  ];

  function getStudent(userId) {
    return users.find(
      (user) => user.id === userId,
    );
  }

  return (
    <div className="admin-dashboard-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">
            Resumen general
          </p>

          <h2>
            Estado actual de la plataforma
          </h2>

          <p>
            Consulta cursos, estudiantes,
            inscripciones, ventas y actividad
            académica desde un único panel.
          </p>
        </div>

        <div className="admin-intro-actions">
          <Link
            to="/admin/cursos/nuevo"
            className="platform-button platform-button-primary"
          >
            <PlatformIcon name="plus" size={18} />
            Crear curso
          </Link>

          <Link
            to="/admin/reportes"
            className="platform-button platform-button-ghost"
          >
            <PlatformIcon name="chart" size={18} />
            Ver reportes
          </Link>
        </div>
      </section>

      <section className="admin-stats-grid">
        {stats.map((stat) => (
          <article
            className={[
              'admin-stat-card',
              stat.className,
            ].join(' ')}
            key={stat.label}
          >
            <div className="admin-stat-icon">
              <PlatformIcon
                name={stat.icon}
                size={24}
              />
            </div>

            <div>
              <span>{stat.label}</span>
              <strong>{stat.value}</strong>
              <small>{stat.trend}</small>
            </div>
          </article>
        ))}
      </section>

      <section className="admin-dashboard-grid">
        <article className="admin-panel-card admin-performance-card">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-page-eyebrow">
                Rendimiento académico
              </p>

              <h3>Cursos con mayor actividad</h3>
            </div>

            <Link to="/admin/cursos">
              Ver cursos
            </Link>
          </div>

          <div className="admin-performance-list">
            {coursePerformance.map(
              ({
                course,
                enrollments: courseStudents,
                completionRate: courseCompletion,
              }) => (
                <article key={course.id}>
                  <img
                    src={course.cover}
                    alt={course.title}
                  />

                  <div>
                    <strong>{course.title}</strong>

                    <span>
                      {courseStudents}{' '}
                      {courseStudents === 1
                        ? 'estudiante'
                        : 'estudiantes'}
                    </span>

                    <div className="admin-progress-line">
                      <span>
                        <i
                          style={{
                            width: `${courseCompletion}%`,
                          }}
                        />
                      </span>

                      <strong>
                        {courseCompletion}%
                      </strong>
                    </div>
                  </div>
                </article>
              ),
            )}
          </div>
        </article>

        <article className="admin-panel-card admin-summary-chart">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-page-eyebrow">
                Inscripciones
              </p>

              <h3>Estado académico</h3>
            </div>
          </div>

          <div className="admin-donut-chart">
            <div
              className="admin-donut"
              style={{
                '--completion': `${completionRate * 3.6}deg`,
              }}
            >
              <span>
                <strong>{completionRate}%</strong>
                <small>Finalización</small>
              </span>
            </div>
          </div>

          <div className="admin-chart-legend">
            <article>
              <span className="active" />
              <div>
                <strong>
                  {activeEnrollments.length}
                </strong>
                <small>En progreso</small>
              </div>
            </article>

            <article>
              <span className="completed" />
              <div>
                <strong>
                  {completedEnrollments.length}
                </strong>
                <small>Completadas</small>
              </div>
            </article>

            <article>
              <span className="certificates" />
              <div>
                <strong>
                  {certificates.length}
                </strong>
                <small>Certificados</small>
              </div>
            </article>
          </div>
        </article>
      </section>

      <section className="admin-dashboard-grid equal">
        <article className="admin-panel-card">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-page-eyebrow">
                Ventas
              </p>

              <h3>Transacciones recientes</h3>
            </div>

            <Link to="/admin/ventas">
              Ver todas
            </Link>
          </div>

          <div className="admin-compact-table">
            <div className="admin-compact-table-head">
              <span>Orden</span>
              <span>Cliente</span>
              <span>Estado</span>
              <span>Total</span>
            </div>

            {recentOrders.map((order) => {
              const student = getStudent(
                order.userId,
              );

              return (
                <div
                  className="admin-compact-table-row"
                  key={order.id}
                >
                  <span>
                    <strong>{order.id}</strong>
                    <small>
                      {formatDate(
                        order.createdAt,
                      )}
                    </small>
                  </span>

                  <span>
                    {student?.name ??
                      'Usuario no disponible'}
                  </span>

                  <span>
                    <i
                      className={[
                        'admin-status-badge',
                        order.paymentStatus,
                      ].join(' ')}
                    >
                      {
                        paymentLabels[
                          order.paymentStatus
                        ]
                      }
                    </i>
                  </span>

                  <strong>
                    {formatCurrency(order.total)}
                  </strong>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-panel-card">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-page-eyebrow">
                Actividad
              </p>

              <h3>Inscripciones recientes</h3>
            </div>

            <Link to="/admin/inscripciones">
              Ver todas
            </Link>
          </div>

          <div className="admin-recent-enrollments">
            {recentEnrollments.map(
              (enrollment) => {
                const student = getStudent(
                  enrollment.userId,
                );

                const course = getCourseById(
                  enrollment.courseId,
                );

                return (
                  <article key={enrollment.id}>
                    <span className="admin-user-avatar">
                      {student?.name
                        ?.split(' ')
                        .slice(0, 2)
                        .map(
                          (part) =>
                            part[0]?.toUpperCase(),
                        )
                        .join('') || '--'}
                    </span>

                    <div>
                      <strong>
                        {student?.name ??
                          'Usuario no disponible'}
                      </strong>

                      <p>
                        {course?.title ??
                          'Curso no disponible'}
                      </p>

                      <small>
                        {formatDate(
                          enrollment.enrolledAt,
                        )}
                      </small>
                    </div>

                    <span
                      className={[
                        'admin-status-badge',
                        enrollment.status,
                      ].join(' ')}
                    >
                      {enrollment.status ===
                      'completed'
                        ? 'Completado'
                        : 'Activo'}
                    </span>
                  </article>
                );
              },
            )}
          </div>
        </article>
      </section>
    </div>
  );
}