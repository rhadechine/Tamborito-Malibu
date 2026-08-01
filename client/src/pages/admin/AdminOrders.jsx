import {
  useMemo,
  useState,
} from 'react';
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

export default function AdminOrders() {
  const [query, setQuery] = useState('');
  const [paymentStatus, setPaymentStatus] =
    useState('all');
  const [method, setMethod] = useState('all');
  const [expandedOrder, setExpandedOrder] =
    useState(null);

  const { users } = useAuth();

  const {
    orders,
    updateOrder,
  } = usePlatform();

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query
      .trim()
      .toLowerCase();

    return [...orders]
      .filter((order) => {
        const student = users.find(
          (user) => user.id === order.userId,
        );

        const matchesQuery =
          !normalizedQuery ||
          [
            order.id,
            order.transactionReference,
            student?.name,
            student?.email,
            ...order.items.map(
              (item) => item.title,
            ),
          ]
            .join(' ')
            .toLowerCase()
            .includes(normalizedQuery);

        const matchesStatus =
          paymentStatus === 'all' ||
          order.paymentStatus ===
            paymentStatus;

        const matchesMethod =
          method === 'all' ||
          order.paymentMethod === method;

        return (
          matchesQuery &&
          matchesStatus &&
          matchesMethod
        );
      })
      .sort(
        (first, second) =>
          new Date(second.createdAt) -
          new Date(first.createdAt),
      );
  }, [
    orders,
    users,
    query,
    paymentStatus,
    method,
  ]);

  const approvedRevenue = orders
    .filter(
      (order) =>
        order.paymentStatus === 'approved',
    )
    .reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0,
    );

  const pendingRevenue = orders
    .filter(
      (order) =>
        order.paymentStatus === 'pending',
    )
    .reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0,
    );

  function updatePaymentStatus(
    order,
    status,
  ) {
    updateOrder(order.id, {
      paymentStatus: status,
      orderStatus:
        status === 'approved'
          ? 'completed'
          : status === 'rejected'
            ? 'cancelled'
            : 'pending',
    });
  }

  return (
    <div className="admin-orders-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">
            Gestión financiera
          </p>

          <h2>Ventas y transacciones</h2>

          <p>
            Consulta órdenes, medios de pago,
            estados, referencias y cursos
            adquiridos.
          </p>
        </div>
      </section>

      <section className="admin-order-summary-grid">
        <article>
          <span>Ingresos aprobados</span>
          <strong>
            {formatCurrency(
              approvedRevenue,
            )}
          </strong>
        </article>

        <article>
          <span>Pagos pendientes</span>
          <strong>
            {formatCurrency(
              pendingRevenue,
            )}
          </strong>
        </article>

        <article>
          <span>Total de órdenes</span>
          <strong>{orders.length}</strong>
        </article>

        <article>
          <span>Aprobadas</span>
          <strong>
            {
              orders.filter(
                (order) =>
                  order.paymentStatus ===
                  'approved',
              ).length
            }
          </strong>
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
            placeholder="Buscar orden, cliente o referencia"
          />
        </div>

        <select
          value={paymentStatus}
          onChange={(event) =>
            setPaymentStatus(
              event.target.value,
            )
          }
        >
          <option value="all">
            Todos los estados
          </option>
          <option value="approved">
            Aprobados
          </option>
          <option value="pending">
            Pendientes
          </option>
          <option value="rejected">
            Rechazados
          </option>
        </select>

        <select
          value={method}
          onChange={(event) =>
            setMethod(event.target.value)
          }
        >
          <option value="all">
            Todos los medios
          </option>
          <option value="PSE">PSE</option>
          <option value="Tarjeta">
            Tarjeta
          </option>
        </select>
      </section>

      <section className="admin-order-list">
        {filteredOrders.map((order) => {
          const student = users.find(
            (user) => user.id === order.userId,
          );

          const expanded =
            expandedOrder === order.id;

          return (
            <article
              className="admin-order-card"
              key={order.id}
            >
              <button
                type="button"
                className="admin-order-card-summary"
                onClick={() =>
                  setExpandedOrder(
                    expanded ? null : order.id,
                  )
                }
              >
                <span className="admin-order-icon">
                  <PlatformIcon
                    name="orders"
                    size={22}
                  />
                </span>

                <span>
                  <strong>{order.id}</strong>
                  <small>
                    {formatDate(
                      order.createdAt,
                    )}
                  </small>
                </span>

                <span>
                  <strong>
                    {student?.name ??
                      'Usuario no disponible'}
                  </strong>
                  <small>
                    {student?.email}
                  </small>
                </span>

                <span>
                  <strong>
                    {order.paymentMethod}
                  </strong>
                  <small>
                    {
                      order.transactionReference
                    }
                  </small>
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
                <div className="admin-order-card-details">
                  <section>
                    <h3>Cursos de la orden</h3>

                    {order.items.map((item) => (
                      <article
                        key={item.courseId}
                      >
                        <span>
                          <PlatformIcon
                            name="book"
                            size={18}
                          />

                          {item.title}
                        </span>

                        <strong>
                          {formatCurrency(
                            item.price,
                          )}
                        </strong>
                      </article>
                    ))}
                  </section>

                  <section>
                    <h3>Datos de transacción</h3>

                    <dl>
                      <div>
                        <dt>Referencia</dt>
                        <dd>
                          {
                            order.transactionReference
                          }
                        </dd>
                      </div>

                      <div>
                        <dt>Método</dt>
                        <dd>
                          {order.paymentMethod}
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
                  </section>

                  <section className="admin-order-status-actions">
                    <h3>Actualizar estado</h3>

                    <button
                      type="button"
                      className="approve"
                      onClick={() =>
                        updatePaymentStatus(
                          order,
                          'approved',
                        )
                      }
                    >
                      Aprobar
                    </button>

                    <button
                      type="button"
                      className="pending"
                      onClick={() =>
                        updatePaymentStatus(
                          order,
                          'pending',
                        )
                      }
                    >
                      Marcar pendiente
                    </button>

                    <button
                      type="button"
                      className="reject"
                      onClick={() =>
                        updatePaymentStatus(
                          order,
                          'rejected',
                        )
                      }
                    >
                      Rechazar
                    </button>
                  </section>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </div>
  );
}