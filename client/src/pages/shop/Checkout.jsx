import { useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import PageShell from '../../components/PageShell';
import FoundationFooter from '../../components/FoundationFooter';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { usePlatform } from '../../context/PlatformContext';
import { formatCurrency } from '../../utils/formatters';

const initialBilling = {
  documentType: 'CC',
  documentNumber: '',
  phone: '',
  bank: '',
  acceptTerms: false,
};

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] =
    useState('PSE');

  const [billing, setBilling] =
    useState(initialBilling);

  const [message, setMessage] =
    useState('');

  const [processing, setProcessing] =
    useState(false);

  const navigate = useNavigate();

  const { user } = useAuth();

  const {
    items,
    count,
    total,
    clearCart,
  } = useCart();

  const { completePurchase } =
    usePlatform();

  if (!items.length) {
    return <Navigate to="/carrito" replace />;
  }

  function updateBilling(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setBilling((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    setMessage('');
  }

  function validatePayment() {
    if (
      !billing.documentNumber.trim()
    ) {
      return 'Ingresa el número de documento.';
    }

    if (!billing.phone.trim()) {
      return 'Ingresa un número de teléfono.';
    }

    if (
      paymentMethod === 'PSE' &&
      !billing.bank
    ) {
      return 'Selecciona una entidad financiera.';
    }

    if (!billing.acceptTerms) {
      return 'Debes aceptar los términos del pago.';
    }

    return '';
  }

  function submitPayment(event) {
    event.preventDefault();

    const validationMessage =
      validatePayment();

    if (validationMessage) {
      setMessage(validationMessage);
      return;
    }

    setProcessing(true);

    window.setTimeout(() => {
      const result = completePurchase({
        userId: user.id,
        cartItems: items,
        paymentMethod,
      });

      setProcessing(false);

      if (!result.ok) {
        setMessage(result.message);
        return;
      }

      clearCart();

      navigate('/campus/compras', {
        state: {
          orderId: result.order.id,
          paymentSuccess: true,
        },
      });
    }, 1200);
  }

  return (
    <PageShell variant="foundation">
      <main className="shop-page checkout-page">
        <section className="shop-header">
          <div className="container">
            <nav className="course-breadcrumb">
              <Link to="/carrito">
                Carrito
              </Link>

              <PlatformIcon
                name="chevronRight"
                size={15}
              />

              <span>Pago</span>
            </nav>

            <p className="section-tag">
              Finalizar compra
            </p>

            <h1>Completa tu pago</h1>

            <p>
              Revisa tus datos y selecciona
              el medio de pago.
            </p>
          </div>
        </section>

        <section className="shop-content">
          <div className="container checkout-layout">
            <form
              className="checkout-form"
              onSubmit={submitPayment}
            >
              <section className="checkout-section">
                <div className="checkout-section-heading">
                  <span>01</span>

                  <div>
                    <h2>
                      Datos del comprador
                    </h2>

                    <p>
                      Información asociada a
                      la cuenta y la
                      transacción.
                    </p>
                  </div>
                </div>

                <div className="checkout-user-card">
                  <div className="checkout-user-avatar">
                    {user.name
                      .split(' ')
                      .slice(0, 2)
                      .map(
                        (part) =>
                          part[0]?.toUpperCase(),
                      )
                      .join('')}
                  </div>

                  <div>
                    <strong>{user.name}</strong>
                    <span>{user.email}</span>
                  </div>

                  <Link to="/campus/perfil">
                    Editar perfil
                  </Link>
                </div>

                <div className="checkout-field-grid">
                  <div className="platform-field">
                    <label htmlFor="documentType">
                      Tipo de documento
                    </label>

                    <select
                      id="documentType"
                      name="documentType"
                      value={
                        billing.documentType
                      }
                      onChange={updateBilling}
                    >
                      <option value="CC">
                        Cédula de ciudadanía
                      </option>
                      <option value="CE">
                        Cédula de extranjería
                      </option>
                      <option value="TI">
                        Tarjeta de identidad
                      </option>
                      <option value="PAS">
                        Pasaporte
                      </option>
                    </select>
                  </div>

                  <div className="platform-field">
                    <label htmlFor="documentNumber">
                      Número de documento
                    </label>

                    <input
                      id="documentNumber"
                      name="documentNumber"
                      type="text"
                      value={
                        billing.documentNumber
                      }
                      onChange={updateBilling}
                      placeholder="Número de identificación"
                    />
                  </div>

                  <div className="platform-field">
                    <label htmlFor="phone">
                      Teléfono
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={billing.phone}
                      onChange={updateBilling}
                      placeholder="300 000 0000"
                    />
                  </div>
                </div>
              </section>

              <section className="checkout-section">
                <div className="checkout-section-heading">
                  <span>02</span>

                  <div>
                    <h2>
                      Método de pago
                    </h2>

                    <p>
                      Selecciona cómo deseas
                      realizar la
                      transacción.
                    </p>
                  </div>
                </div>

                <div className="payment-method-grid">
                  <label
                    className={[
                      'payment-method-card',
                      paymentMethod === 'PSE'
                        ? 'selected'
                        : '',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PSE"
                      checked={
                        paymentMethod === 'PSE'
                      }
                      onChange={(event) =>
                        setPaymentMethod(
                          event.target.value,
                        )
                      }
                    />

                    <span className="payment-method-logo">
                      PSE
                    </span>

                    <span>
                      <strong>
                        Débito desde cuenta
                      </strong>
                      <small>
                        Pago mediante PSE
                      </small>
                    </span>
                  </label>

                  <label
                    className={[
                      'payment-method-card',
                      paymentMethod ===
                      'Tarjeta'
                        ? 'selected'
                        : '',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Tarjeta"
                      checked={
                        paymentMethod ===
                        'Tarjeta'
                      }
                      onChange={(event) =>
                        setPaymentMethod(
                          event.target.value,
                        )
                      }
                    />

                    <span className="payment-method-logo card">
                      CARD
                    </span>

                    <span>
                      <strong>
                        Tarjeta
                      </strong>
                      <small>
                        Crédito o débito
                      </small>
                    </span>
                  </label>
                </div>

                {paymentMethod === 'PSE' ? (
                  <div className="platform-field">
                    <label htmlFor="bank">
                      Entidad financiera
                    </label>

                    <select
                      id="bank"
                      name="bank"
                      value={billing.bank}
                      onChange={updateBilling}
                    >
                      <option value="">
                        Selecciona un banco
                      </option>
                      <option value="Bancolombia">
                        Bancolombia
                      </option>
                      <option value="Banco de Bogotá">
                        Banco de Bogotá
                      </option>
                      <option value="Davivienda">
                        Davivienda
                      </option>
                      <option value="Banco Agrario">
                        Banco Agrario
                      </option>
                      <option value="Nequi">
                        Nequi
                      </option>
                    </select>
                  </div>
                ) : (
                  <div className="checkout-card-placeholder">
                    <PlatformIcon
                      name="lock"
                      size={25}
                    />

                    <p>
                      Los campos reales de
                      tarjeta serán
                      proporcionados por la
                      pasarela de pago para
                      evitar almacenar datos
                      sensibles en el
                      frontend.
                    </p>
                  </div>
                )}
              </section>

              <section className="checkout-section">
                <div className="checkout-section-heading">
                  <span>03</span>

                  <div>
                    <h2>
                      Confirmación
                    </h2>

                    <p>
                      Acepta las condiciones
                      para finalizar.
                    </p>
                  </div>
                </div>

                <label className="platform-checkbox">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    checked={
                      billing.acceptTerms
                    }
                    onChange={updateBilling}
                  />

                  <span>
                    Confirmo que la
                    información es correcta y
                    acepto los términos de la
                    compra.
                  </span>
                </label>

                <div className="checkout-demo-warning">
                  <PlatformIcon
                    name="settings"
                    size={22}
                  />

                  <p>
                    Esta versión simula una
                    transacción aprobada. La
                    conexión real con PSE o
                    una pasarela certificada
                    se implementará en Django
                    REST Framework.
                  </p>
                </div>

                {message && (
                  <div className="platform-alert warning">
                    {message}
                  </div>
                )}
              </section>
            </form>

            <aside className="checkout-summary-card">
              <h2>Tu compra</h2>

              <div className="checkout-summary-items">
                {items.map((item) => (
                  <article key={item.id}>
                    <img
                      src={item.cover}
                      alt={item.title}
                    />

                    <span>
                      <strong>
                        {item.title}
                      </strong>
                      <small>
                        {formatCurrency(
                          item.price,
                        )}
                      </small>
                    </span>
                  </article>
                ))}
              </div>

              <div className="order-summary-lines">
                <div>
                  <span>
                    Cursos ({count})
                  </span>
                  <strong>
                    {formatCurrency(total)}
                  </strong>
                </div>

                <div>
                  <span>Descuento</span>
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

              <button
                type="button"
                className="platform-button platform-button-primary platform-button-large"
                disabled={processing}
                onClick={submitPayment}
              >
                {processing
                  ? 'Procesando pago...'
                  : `Pagar ${formatCurrency(
                      total,
                    )}`}
              </button>

              <div className="checkout-security-note">
                <PlatformIcon
                  name="lock"
                  size={18}
                />

                <span>
                  Transacción segura y acceso
                  inmediato después de la
                  aprobación.
                </span>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}