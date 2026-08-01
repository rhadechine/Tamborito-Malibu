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

const initialForm = {
  name: '',
  email: '',
  phone: '',
  city: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
};

export default function Register() {
  const [form, setForm] =
    useState(initialForm);

  const [message, setMessage] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const navigate = useNavigate();
  const { user, register } = useAuth();

  if (user) {
    return (
      <Navigate
        to={
          user.role === 'admin'
            ? '/admin'
            : '/campus'
        }
        replace
      />
    );
  }

  function updateField(event) {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        type === 'checkbox'
          ? checked
          : value,
    }));

    setMessage('');
  }

  function submitRegister(event) {
    event.preventDefault();

    if (form.name.trim().length < 3) {
      setMessage(
        'Escribe tu nombre completo.',
      );
      return;
    }

    if (form.password.length < 8) {
      setMessage(
        'La contraseña debe tener al menos 8 caracteres.',
      );
      return;
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      setMessage(
        'Las contraseñas no coinciden.',
      );
      return;
    }

    if (!form.acceptTerms) {
      setMessage(
        'Debes aceptar los términos y la política de tratamiento de datos.',
      );
      return;
    }

    const result = register({
      name: form.name,
      email: form.email,
      phone: form.phone,
      city: form.city,
      password: form.password,
    });

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    navigate('/campus');
  }

  return (
    <PageShell variant="foundation">
      <main className="auth-page register-page">
        <section className="auth-visual-panel register-visual">
          <div className="auth-visual-overlay" />

          <div className="auth-visual-content">
            <Link
              to="/fundacion"
              className="auth-brand"
            >
              Fundación{' '}
              <span>Tamborito</span>
            </Link>

            <div>
              <p className="auth-eyebrow">
                Únete al proceso
              </p>

              <h1>
                Crea tu cuenta y comienza
                una ruta de aprendizaje.
              </h1>

              <p>
                Tu cuenta permite registrar
                inscripciones, compras,
                progreso, actividades y
                certificados.
              </p>
            </div>

            <ul className="auth-benefit-list">
              <li>
                <PlatformIcon
                  name="check"
                  size={20}
                />
                Cursos gratuitos y pagos
              </li>

              <li>
                <PlatformIcon
                  name="check"
                  size={20}
                />
                Progreso guardado
                automáticamente
              </li>

              <li>
                <PlatformIcon
                  name="check"
                  size={20}
                />
                Historial de compras e
                inscripciones
              </li>

              <li>
                <PlatformIcon
                  name="check"
                  size={20}
                />
                Certificados y constancias
              </li>
            </ul>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container register-container">
            <div className="auth-form-heading">
              <p className="section-tag">
                Registro de estudiante
              </p>

              <h2>Crear cuenta</h2>

              <p>
                Completa tus datos para
                ingresar al campus Tamborito.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={submitRegister}
            >
              <div className="platform-field">
                <label htmlFor="name">
                  Nombre completo
                </label>

                <div className="platform-input-shell">
                  <PlatformIcon
                    name="user"
                    size={19}
                  />

                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={form.name}
                    onChange={updateField}
                    placeholder="Nombres y apellidos"
                    required
                  />
                </div>
              </div>

              <div className="platform-field">
                <label htmlFor="email">
                  Correo electrónico
                </label>

                <div className="platform-input-shell">
                  <PlatformIcon
                    name="user"
                    size={19}
                  />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={form.email}
                    onChange={updateField}
                    placeholder="correo@ejemplo.com"
                    required
                  />
                </div>
              </div>

              <div className="auth-form-row">
                <div className="platform-field">
                  <label htmlFor="phone">
                    Teléfono
                  </label>

                  <div className="platform-input-shell">
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={form.phone}
                      onChange={updateField}
                      placeholder="300 000 0000"
                    />
                  </div>
                </div>

                <div className="platform-field">
                  <label htmlFor="city">
                    Ciudad
                  </label>

                  <div className="platform-input-shell">
                    <input
                      id="city"
                      name="city"
                      type="text"
                      value={form.city}
                      onChange={updateField}
                      placeholder="Zambrano, Bolívar"
                    />
                  </div>
                </div>
              </div>

              <div className="auth-form-row">
                <div className="platform-field">
                  <label htmlFor="password">
                    Contraseña
                  </label>

                  <div className="platform-input-shell">
                    <PlatformIcon
                      name="lock"
                      size={19}
                    />

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      value={form.password}
                      onChange={updateField}
                      placeholder="Mínimo 8 caracteres"
                      required
                    />
                  </div>
                </div>

                <div className="platform-field">
                  <label htmlFor="confirmPassword">
                    Confirmar contraseña
                  </label>

                  <div className="platform-input-shell">
                    <PlatformIcon
                      name="lock"
                      size={19}
                    />

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      value={
                        form.confirmPassword
                      }
                      onChange={updateField}
                      placeholder="Repite la contraseña"
                      required
                    />
                  </div>
                </div>
              </div>

              <label className="platform-checkbox">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={form.acceptTerms}
                  onChange={updateField}
                />

                <span>
                  Acepto los términos de uso
                  y la política de
                  tratamiento de datos.
                </span>
              </label>

              <button
                type="button"
                className="auth-text-button password-toggle"
                onClick={() =>
                  setShowPassword(
                    (current) => !current,
                  )
                }
              >
                {showPassword
                  ? 'Ocultar contraseñas'
                  : 'Mostrar contraseñas'}
              </button>

              {message && (
                <div className="platform-alert warning">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="platform-button platform-button-primary platform-button-large"
              >
                Crear cuenta
              </button>
            </form>

            <p className="auth-form-footer">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login">
                Iniciar sesión
              </Link>
            </p>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}