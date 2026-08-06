import { useMemo } from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { usePlatform } from '../../context/PlatformContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

const donationTransactions = [
  {
    id: 'DON-2401',
    type: 'Donación',
    detail: 'Aporte voluntario al proceso cultural Tamborito',
    amount: 85000,
    date: '2026-07-14T10:30:00.000Z',
    source: 'PSE',
  },
  {
    id: 'DON-2398',
    type: 'Donación',
    detail: 'Donación dirigida a actividades formativas',
    amount: 150000,
    date: '2026-06-29T16:15:00.000Z',
    source: 'PSE',
  },
];

function getCourseSales(courseId, approvedOrders) {
  return approvedOrders.reduce((total, order) => {
    const amount = order.items.reduce((itemTotal, item) => {
      if (item.courseId !== courseId) {
        return itemTotal;
      }

      return itemTotal + Number(item.price || 0);
    }, 0);

    return total + amount;
  }, 0);
}

export default function AdminAnalytics() {
  const { courses, enrollments, orders } = usePlatform();

  const approvedOrders = orders.filter(
    (order) => order.paymentStatus === 'approved',
  );

  const courseTransactions = approvedOrders.flatMap((order) =>
    order.items.map((item) => ({
      id: `${order.id}-${item.courseId}`,
      type: 'Compra de curso',
      detail: item.title,
      amount: Number(item.price || 0),
      date: order.createdAt,
      source: order.paymentMethod,
      reference: order.transactionReference,
    })),
  );

  const transactions = useMemo(
    () =>
      [...courseTransactions, ...donationTransactions].sort(
        (first, second) => new Date(second.date) - new Date(first.date),
      ),
    [courseTransactions],
  );

  const courseRevenue = courseTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const donationRevenue = donationTransactions.reduce(
    (total, transaction) => total + transaction.amount,
    0,
  );

  const totalRevenue = courseRevenue + donationRevenue;

  const courseReport = courses
    .map((course) => {
      const courseEnrollments = enrollments.filter(
        (enrollment) => enrollment.courseId === course.id,
      );

      return {
        course,
        students: courseEnrollments.length,
        sales: getCourseSales(course.id, approvedOrders),
      };
    })
    .sort((first, second) => second.students - first.students);

  return (
    <div className="admin-analytics-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">Reportes financieros</p>
          <h2>Ingresos de la Fundación</h2>
          <p>
            Consulta transacciones aprobadas por cursos y donaciones. Los datos
            académicos se mantienen en la sección de estudiantes para evitar
            duplicidad de información.
          </p>
        </div>
      </section>

      <section className="admin-analytics-stats admin-finance-stats">
        <article>
          <div>
            <PlatformIcon name="orders" size={23} />
          </div>
          <span>
            <small>Ingresos totales</small>
            <strong>{formatCurrency(totalRevenue)}</strong>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon name="book" size={23} />
          </div>
          <span>
            <small>Cursos vendidos</small>
            <strong>{formatCurrency(courseRevenue)}</strong>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon name="star" size={23} />
          </div>
          <span>
            <small>Donaciones</small>
            <strong>{formatCurrency(donationRevenue)}</strong>
          </span>
        </article>

        <article>
          <div>
            <PlatformIcon name="users" size={23} />
          </div>
          <span>
            <small>Total inscripciones</small>
            <strong>{enrollments.length}</strong>
          </span>
        </article>
      </section>

      <section className="admin-panel-card admin-transaction-report">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-page-eyebrow">Transacciones</p>
            <h3>Movimientos aprobados</h3>
          </div>
        </div>

        <div className="admin-transaction-table-head">
          <span>Detalle o motivo</span>
          <span>Tipo</span>
          <span>Monto</span>
          <span>Fecha</span>
          <span>Medio</span>
        </div>

        {transactions.map((transaction) => (
          <article className="admin-transaction-table-row" key={transaction.id}>
            <div>
              <strong>{transaction.detail}</strong>
              <small>{transaction.reference || transaction.id}</small>
            </div>
            <span>{transaction.type}</span>
            <strong>{formatCurrency(transaction.amount)}</strong>
            <span>{formatDate(transaction.date)}</span>
            <span>{transaction.source}</span>
          </article>
        ))}
      </section>

      <section className="admin-panel-card admin-course-report-table">
        <div className="admin-panel-heading">
          <div>
            <p className="admin-page-eyebrow">Cursos</p>
            <h3>Inscripciones e ingresos por curso</h3>
          </div>
        </div>

        <div className="admin-report-table-head admin-report-table-head-clean">
          <span>Curso</span>
          <span>Inscritos</span>
          <span>Acceso</span>
          <span>Ingresos</span>
        </div>

        {courseReport.map(({ course, students, sales }) => (
          <article
            className="admin-report-table-row admin-report-table-row-clean"
            key={course.id}
          >
            <div>
              <img src={course.cover} alt={course.title} />
              <span>
                <strong>{course.title}</strong>
                <small>{course.category}</small>
              </span>
            </div>

            <strong>{students}</strong>
            <span>{course.isFree ? 'Gratuito' : 'Pago'}</span>
            <strong>{formatCurrency(sales)}</strong>
          </article>
        ))}
      </section>
    </div>
  );
}