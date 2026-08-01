import { useMemo } from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatCurrency } from '../../utils/formatters';

const monthNames = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export default function AdminAnalytics() {
  const { users } = useAuth();

  const {
    courses,
    enrollments,
    orders,
    getCourseById,
  } = usePlatform();

  const students = users.filter(
    (user) => user.role === 'client',
  );

  const approvedOrders = orders.filter(
    (order) => order.paymentStatus === 'approved',
  );

  const totalRevenue = approvedOrders.reduce(
    (total, order) =>
      total + Number(order.total || 0),
    0,
  );

  const monthlyRevenue = useMemo(() => {
    const values = Array.from(
      { length: 12 },
      (_, index) => ({
        month: monthNames[index],
        value: 0,
      }),
    );

    approvedOrders.forEach((order) => {
      const date = new Date(order.createdAt);

      values[date.getMonth()].value +=
        Number(order.total || 0);
    });

    return values;
  }, [approvedOrders]);

  const maximumMonthlyRevenue =
    Math.max(
      ...monthlyRevenue.map(
        (item) => item.value,
      ),
      1,
    );

  const courseAnalytics = courses
    .map((course) => {
      const courseEnrollments =
        enrollments.filter(
          (enrollment) =>
            enrollment.courseId ===
            course.id,
        );

      const completed =
        courseEnrollments.filter(
          (enrollment) =>
            enrollment.status ===
            'completed',
        ).length;

      const sales = approvedOrders.reduce(
        (total, order) => {
          const matchingItem =
            order.items.find(
              (item) =>
                item.courseId ===
                course.id,
            );

          return (
            total +
            Number(
              matchingItem?.price || 0,
            )
          );
        },
        0,
      );

      return {
        course,
        students: courseEnrollments.length,
        completed,
        completionRate:
          courseEnrollments.length > 0
            ? Math.round(
                (completed /
                  courseEnrollments.length) *
                  100,
              )
            : 0,
        sales,
      };
    })
    .sort(
      (first, second) =>
        second.students - first.students,
    );

  const totalCompletions =
    enrollments.filter(
      (enrollment) =>
        enrollment.status === 'completed',
    ).length;

  const averageCompletion =
    enrollments.length > 0
      ? Math.round(
          (totalCompletions /
            enrollments.length) *
            100,
        )
      : 0;

  return (
    <div className="admin-analytics-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">
            Indicadores
          </p>

          <h2>Reportes de la plataforma</h2>

          <p>
            Analiza crecimiento, ventas,
            inscripciones y finalización de
            cursos.
          </p>
        </div>
      </section>

      <section className="admin-analytics-stats">
        <article>
          <div>
            <PlatformIcon
              name="orders"
              size={23}
            />
          </div>
          <span>
            <small>Ingresos</small>
            <strong>
              {formatCurrency(totalRevenue)}
            </strong>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon
              name="users"
              size={23}
            />
          </div>
          <span>
            <small>Estudiantes</small>
            <strong>{students.length}</strong>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon
              name="lessons"
              size={23}
            />
          </div>
          <span>
            <small>Inscripciones</small>
            <strong>
              {enrollments.length}
            </strong>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon
              name="certificate"
              size={23}
            />
          </div>
          <span>
            <small>Finalización</small>
            <strong>
              {averageCompletion}%
            </strong>
          </span>
        </article>
      </section>

      <section className="admin-analytics-grid">
        <article className="admin-panel-card admin-revenue-chart">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-page-eyebrow">
                Ventas por mes
              </p>

              <h3>Ingresos aprobados</h3>
            </div>

            <strong>
              {formatCurrency(totalRevenue)}
            </strong>
          </div>

          <div className="admin-bar-chart">
            {monthlyRevenue.map((item) => (
              <article key={item.month}>
                <div>
                  <span
                    style={{
                      height: `${
                        (item.value /
                          maximumMonthlyRevenue) *
                        100
                      }%`,
                    }}
                    title={formatCurrency(
                      item.value,
                    )}
                  />
                </div>

                <small>{item.month}</small>
              </article>
            ))}
          </div>
        </article>

        <article className="admin-panel-card admin-access-report">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-page-eyebrow">
                Modelo de acceso
              </p>

              <h3>Cursos gratuitos y pagos</h3>
            </div>
          </div>

          <div className="admin-access-report-bars">
            <article>
              <div>
                <span>Gratuitos</span>
                <strong>
                  {
                    courses.filter(
                      (course) =>
                        course.isFree,
                    ).length
                  }
                </strong>
              </div>

              <span>
                <i
                  style={{
                    width: `${
                      courses.length
                        ? (courses.filter(
                            (course) =>
                              course.isFree,
                          ).length /
                            courses.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </span>
            </article>

            <article>
              <div>
                <span>Pagos</span>
                <strong>
                  {
                    courses.filter(
                      (course) =>
                        !course.isFree,
                    ).length
                  }
                </strong>
              </div>

              <span>
                <i
                  style={{
                    width: `${
                      courses.length
                        ? (courses.filter(
                            (course) =>
                              !course.isFree,
                          ).length /
                            courses.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </span>
            </article>

            <article>
              <div>
                <span>Publicados</span>
                <strong>
                  {
                    courses.filter(
                      (course) =>
                        course.status ===
                        'published',
                    ).length
                  }
                </strong>
              </div>

              <span>
                <i
                  style={{
                    width: `${
                      courses.length
                        ? (courses.filter(
                            (course) =>
                              course.status ===
                              'published',
                          ).length /
                            courses.length) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </span>
            </article>
          </div>
        </article>
      </section>

      <section className="admin-panel-card admin-course-report-table">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-page-eyebrow">
              Rendimiento por curso
            </p>

            <h3>
              Inscripciones, finalización y
              ventas
            </h3>
          </div>
        </div>

        <div className="admin-report-table-head">
          <span>Curso</span>
          <span>Inscritos</span>
          <span>Completados</span>
          <span>Finalización</span>
          <span>Ingresos</span>
        </div>

        {courseAnalytics.map(
          ({
            course,
            students: courseStudents,
            completed,
            completionRate,
            sales,
          }) => (
            <article
              className="admin-report-table-row"
              key={course.id}
            >
              <div>
                <img
                  src={course.cover}
                  alt={course.title}
                />

                <span>
                  <strong>{course.title}</strong>
                  <small>
                    {course.category}
                  </small>
                </span>
              </div>

              <strong>{courseStudents}</strong>
              <strong>{completed}</strong>

              <div className="admin-report-progress">
                <span>
                  <i
                    style={{
                      width: `${completionRate}%`,
                    }}
                  />
                </span>
                <strong>
                  {completionRate}%
                </strong>
              </div>

              <strong>
                {formatCurrency(sales)}
              </strong>
            </article>
          ),
        )}
      </section>
    </div>
  );
}