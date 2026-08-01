import { Link } from 'react-router-dom';
import PageShell from '../../components/PageShell';
import FoundationFooter from '../../components/FoundationFooter';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/formatters';

export default function Cart() {
  const {
    items,
    count,
    total,
    removeCourse,
    clearCart,
  } = useCart();

  const { user } = useAuth();

  return (
    <PageShell variant="foundation">
      <main className="shop-page">
        <section className="shop-header">
          <div className="container">
            <nav className="course-breadcrumb">
              <Link to="/fundacion">
                Fundación
              </Link>

              <PlatformIcon
                name="chevronRight"
                size={15}
              />

              <Link to="/cursos">
                Cursos
              </Link>

              <PlatformIcon
                name="chevronRight"
                size={15}
              />

              <span>Carrito</span>
            </nav>

            <p className="section-tag">
              Compra de cursos
            </p>

            <h1>Tu carrito</h1>

            <p>
              Revisa los cursos seleccionados
              antes de continuar con el pago.
            </p>
          </div>
        </section>

        <section className="shop-content">
          <div className="container shop-layout">
            <div className="cart-main">
              <div className="cart-heading">
                <div>
                  <h2>
                    Cursos seleccionados
                  </h2>

                  <span>
                    {count}{' '}
                    {count === 1
                      ? 'curso'
                      : 'cursos'}
                  </span>
                </div>

                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={clearCart}
                  >
                    Vaciar carrito
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="cart-empty">
                  <div>
                    <PlatformIcon
                      name="cart"
                      size={48}
                    />
                  </div>

                  <h2>
                    Tu carrito está vacío
                  </h2>

                  <p>
                    Explora la oferta de
                    Fundación Tamborito y
                    agrega un curso de pago.
                  </p>

                  <Link
                    to="/cursos"
                    className="platform-button platform-button-primary"
                  >
                    Explorar cursos
                  </Link>
                </div>
              ) : (
                <div className="cart-course-list">
                  {items.map((item) => (
                    <article
                      className="cart-course-item"
                      key={item.id}
                    >
                      <Link
                        to={`/cursos/${item.slug}`}
                        className="cart-course-image"
                      >
                        <img
                          src={item.cover}
                          alt={item.title}
                        />
                      </Link>

                      <div className="cart-course-copy">
                        <span>
                          {item.category}
                        </span>

                        <Link
                          to={`/cursos/${item.slug}`}
                        >
                          {item.title}
                        </Link>

                        <p>
                          Acceso completo al
                          curso, recursos,
                          actividades y
                          certificado cuando
                          aplique.
                        </p>
                      </div>

                      <div className="cart-course-price">
                        <strong>
                          {formatCurrency(
                            item.price,
                          )}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            removeCourse(
                              item.id,
                            )
                          }
                        >
                          <PlatformIcon
                            name="trash"
                            size={17}
                          />
                          Eliminar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="cart-benefits">
                <article>
                  <PlatformIcon
                    name="lock"
                    size={23}
                  />
                  <span>
                    <strong>
                      Pago protegido
                    </strong>
                    <small>
                      Integración real desde
                      backend
                    </small>
                  </span>
                </article>

                <article>
                  <PlatformIcon
                    name="book"
                    size={23}
                  />
                  <span>
                    <strong>
                      Acceso inmediato
                    </strong>
                    <small>
                      Curso disponible al
                      aprobarse el pago
                    </small>
                  </span>
                </article>

                <article>
                  <PlatformIcon
                    name="certificate"
                    size={23}
                  />
                  <span>
                    <strong>
                      Certificación
                    </strong>
                    <small>
                      Al completar requisitos
                    </small>
                  </span>
                </article>
              </div>
            </div>

            <aside className="order-summary-card">
              <h2>Resumen</h2>

              <div className="order-summary-lines">
                <div>
                  <span>
                    Subtotal ({count})
                  </span>
                  <strong>
                    {formatCurrency(total)}
                  </strong>
                </div>

                <div>
                  <span>Descuentos</span>
                  <strong>
                    {formatCurrency(0)}
                  </strong>
                </div>
              </div>

              <div className="order-summary-total">
                <span>Total</span>

                <strong>
                  {formatCurrency(total)}
                </strong>
              </div>

              {items.length > 0 && (
                <Link
                  to={
                    user
                      ? '/checkout'
                      : `/login?next=${encodeURIComponent(
                          '/checkout',
                        )}`
                  }
                  className="platform-button platform-button-primary platform-button-large"
                >
                  Continuar al pago
                </Link>
              )}

              <Link
                to="/cursos"
                className="order-summary-back"
              >
                <PlatformIcon
                  name="chevronRight"
                  size={17}
                  className="back-icon"
                />
                Seguir explorando
              </Link>

              <div className="order-summary-note">
                <PlatformIcon
                  name="lock"
                  size={18}
                />

                <p>
                  Tus datos de pago serán
                  procesados por una pasarela
                  segura cuando se conecte el
                  backend.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}