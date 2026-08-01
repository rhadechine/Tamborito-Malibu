import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Checkout() {
  const [paymentMethod, setPaymentMethod] = useState('PSE');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { completePurchase } = useAuth();

  function submitPayment(event) {
    event.preventDefault();

    const result = completePurchase(items, paymentMethod);

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    clearCart();
    navigate('/dashboard');
  }

  return (
    <DashboardLayout
      title="Finalizar compra"
      subtitle="Vista de prueba para simular el flujo de pago de cursos. La pasarela real se conectará luego desde Django."
      mode="client"
    >
      {items.length === 0 ? (
        <div className="rounded-[24px] bg-[#f6f2eb] p-6">
          <h2 className="font-display text-[2.4rem] leading-none">No tienes cursos en el carrito.</h2>
          <p className="mt-3 text-muted">Agrega cursos pagos antes de continuar.</p>
          <Link to="/cursos" className="btn btn-primary mt-5">
            Ver cursos
          </Link>
        </div>
      ) : (
        <form onSubmit={submitPayment} className="grid gap-6">
          <div>
            <p className="section-tag">Resumen de compra</p>
            <h2 className="font-display text-[2.8rem] leading-none">Pago de cursos Tamborito</h2>
          </div>

          <div className="grid gap-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-[20px] bg-[#f6f2eb] p-4"
              >
                <div>
                  <strong>{item.title}</strong>
                  <p className="text-sm text-muted">{item.category}</p>
                </div>

                <strong className="text-accent">{item.price}</strong>
              </article>
            ))}
          </div>

          <div className="rounded-[20px] bg-dark p-6 text-white">
            <span className="text-white/70">Total a pagar</span>
            <strong className="block font-display text-[3rem] leading-none">
              ${total.toLocaleString('es-CO')} COP
            </strong>
          </div>

          <div className="input-group">
            <label htmlFor="paymentMethod">Método de pago</label>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
            >
              <option value="PSE">PSE</option>
              <option value="Tarjeta débito/crédito">Tarjeta débito/crédito</option>
              <option value="Transferencia bancaria">Transferencia bancaria</option>
            </select>
          </div>

          <div className="rounded-[18px] bg-[#fff0d8] p-5 text-sm text-[#8a5a14]">
            Esta pantalla todavía no procesa pagos reales. Simula una transacción aprobada y agrega
            los cursos al panel del usuario. La integración real debe hacerse desde backend con
            proveedor de pagos.
          </div>

          {message && (
            <div className="rounded-[18px] bg-[#fff0d8] p-5 font-semibold text-[#8a5a14]">
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary full-btn">
            Simular pago aprobado
          </button>
        </form>
      )}
    </DashboardLayout>
  );
}