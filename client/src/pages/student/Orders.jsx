import { useState } from 'react';
import {
  Link,
  useLocation,
} from 'react-router-dom';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';
import {
  formatCurrency,
  formatDate,
} from '../../utils/formatters';

const paymentStatusLabels = {
  approved: 'Aprobado',
  pending: 'Pendiente',
  rejected: 'Rechazado',
};

const orderStatusLabels = {
  completed: 'Completada',
  pending: 'Pendiente',
  cancelled: 'Cancelada',
};

export default function Orders() {
  const [expandedOrder, setExpandedOrder] =
    useState(null);

  const location = useLocation();
  const { user } = useAuth();

  const { getUserOrders } = usePlatform();

  const orders = getUserOrders(user.id).sort(
    (first, second) =>
      new Date(second.createdAt) -
      new Date(first.createdAt),
  );

  const recentOrderId =
    location.state?.orderId ?? null;

  const paymentSuccess =
    location.state?.paymentSuccess ?? false;

  return (
    <div className="student-orders-page">
      <section className="student-page-header">
        <div>
          <p className="student-page-eyebrow">
            Historial financiero
          </p>

          <h2>Mis compras</h2>

          <p>
            Consulta cursos adquiridos, medios de pago,
            referencias y estados de las transacciones.
          </p>
        </div>

        <Link
          to="/cursos"
          className="platform-button platform-button-primary"
        >
          <PlatformIcon name="plus" size={18} />
          Comprar otro curso
        </Link>
      </section>

      {paymentSuccess && recentOrderId && (
        <section className="student-payment-success">
          <div>
            <PlatformIcon name="check" size={27} />
          </div>

          <span>
            <strong>Pago aprobado</strong>
            <p>
              La orden {recentOrderId} fue procesada y
              los cursos ya están disponibles en tu
              campus.
            </p>
          </span>

          <Link to="/campus/cursos">
            Ir a mis cursos
          </Link>
        </section>
      )}

      {orders.length === 0 ? (
        <section className="student-empty-state">
          <div>
            <PlatformIcon name="orders" size={44} />
          </div>

          <h2>No tienes compras registradas.</h2>

          <p>
            Los cursos pagos aparecerán aquí después de
            completar una transacción.
          </p>

          <Link
            to="/cursos"
            className="platform-button platform-button-primary"
          >
            Explorar cursos
          </Link>
        </section>
      ) : (
        <section className="student-orders-list">
          {orders.map((order) => {
            const expanded =
              expandedOrder === order.id;

            return (
              <article
                className={[
                  'student-order-card',
                  recentOrderId === order.id
                    ? 'highlighted'
                    : '',
                ].join(' ')}
                key={order.id}
              >
                <button
                  type="button"
                  className="student-order-summary"
                  onClick={() =>
                    setExpandedOrder(
                      expanded ? null : order.id,
                    )
                  }
                >
                  <div className="student-order-icon">
                    <PlatformIcon
                      name="orders"
                      size={23}
                    />
                  </div>

                  <div className="student-order-main-copy">
                    <strong>{order.id}</strong>
                    <span>
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  <div className="student-order-method">
                    <span>Método</span>
                    <strong>
                      {order.paymentMethod}
                    </strong>
                  </div>

                  <div className="student-order-state">
                    <span
                      className={[
                        'student-order-status',
                        order.paymentStatus,
                      ].join(' ')}
                    >
                      {
                        paymentStatusLabels[
                          order.paymentStatus
                        ]
                      }
                    </span>

                    <strong>
                      {formatCurrency(order.total)}
                    </strong>
                  </div>

                  <PlatformIcon
                    name={
                      expanded
                        ? 'chevronDown'
                        : 'chevronRight'
                    }
                    size={20}
                  />
                </button>

                {expanded && (
                  <div className="student-order-details">
                    <div className="student-order-items">
                      <h3>Cursos adquiridos</h3>

                      {order.items.map((item) => (
                        <article
                          key={item.courseId}
                        >
                          <span>
                            <PlatformIcon
                              name="book"
                              size={19}
                            />

                            <strong>
                              {item.title}
                            </strong>
                          </span>

                          <strong>
                            {formatCurrency(
                              item.price,
                            )}
                          </strong>
                        </article>
                      ))}
                    </div>

                    <div className="student-order-information">
                      <h3>Información del pago</h3>

                      <dl>
                        <div>
                          <dt>
                            Referencia
                          </dt>
                          <dd>
                            {
                              order.transactionReference
                            }
                          </dd>
                        </div>

                        <div>
                          <dt>
                            Estado de orden
                          </dt>
                          <dd>
                            {
                              orderStatusLabels[
                                order.orderStatus
                              ]
                            }
                          </dd>
                        </div>

                        <div>
                          <dt>Subtotal</dt>
                          <dd>
                            {formatCurrency(
                              order.subtotal,
                            )}
                          </dd>
                        </div>

                        <div>
                          <dt>Total</dt>
                          <dd>
                            {formatCurrency(
                              order.total,
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </section>
      )}

      <section className="student-orders-help">
        <PlatformIcon name="user" size={25} />

        <div>
          <h3>¿Tienes problemas con una compra?</h3>

          <p>
            Conserva el número de orden y la referencia
            de la transacción para solicitar soporte.
          </p>
        </div>

        <Link
          to="/inscripcion"
          className="platform-button platform-button-ghost"
        >
          Contactar soporte
        </Link>
      </section>
    </div>
  );
}