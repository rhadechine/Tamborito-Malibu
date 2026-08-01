import { useState } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import PageShell from '../../components/PageShell';
import FoundationFooter from '../../components/FoundationFooter';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';

const initialForm = {
  email: '',
  password: '',
};

export default function Login() {
  const [form, setForm] =
    useState(initialForm);

  const [message, setMessage] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, login } = useAuth();

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

  const next = searchParams.get('next');

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setMessage('');
  }

  function redirectAfterLogin(loggedUser) {
    if (next) {
      navigate(next);
      return;
    }

    navigate(
      loggedUser.role === 'admin'
        ? '/admin'
        : '/campus',
    );
  }

  function submitLogin(event) {
    event.preventDefault();

    const result = login(
      form.email,
      form.password,
    );

    if (!result.ok) {
      setMessage(result.message);
      return;
    }

    redirectAfterLogin(result.user);
  }

  function loginAsDemo(role) {
    const credentials =
      role === 'admin'
        ? {
            email:
              'admin@tamborito.org',
            password: 'admin123',
          }
        : {
            email:
              'cliente@tamborito.org',
            password: 'cliente123',
          };

    const result = login(
      credentials.email,
      credentials.password,
    );

    if (result.ok) {
      redirectAfterLogin(result.user);
    }
  }

  return (
    <PageShell variant="foundation">
      <main className="auth-page">
        <section className="auth-visual-panel">
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
                Campus cultural
              </p>

              <h1>
                Continúa aprendiendo desde
                donde quedaste.
              </h1>

              <p>
                Accede a tus cursos,
                actividades, evaluaciones,
                compras y certificados desde
                un solo lugar.
              </p>
            </div>

            <div className="auth-visual-stats">
              <article>
                <strong>Progreso</strong>
                <span>
                  Registro detallado por
                  curso
                </span>
              </article>

              <article>
                <strong>Recursos</strong>
                <span>
                  Videos, lecturas y
                  actividades
                </span>
              </article>

              <article>
                <strong>Certificación</strong>
                <span>
                  Constancias al completar
                  rutas
                </span>
              </article>
            </div>
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-form-heading">
              <p className="section-tag">
                Bienvenido de nuevo
              </p>

              <h2>Iniciar sesión</h2>

              <p>
                Ingresa con el correo y la
                contraseña asociados a tu
                cuenta.
              </p>
            </div>

            <form
              className="auth-form"
              onSubmit={submitLogin}
            >
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

              <div className="platform-field">
                <div className="platform-label-row">
                  <label htmlFor="password">
                    Contraseña
                  </label>

                  <button
                    type="button"
                    className="auth-text-button"
                    onClick={() =>
                      setMessage(
                        'La recuperación real se conectará cuando implementemos Django.',
                      )
                    }
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

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
                    autoComplete="current-password"
                    value={form.password}
                    onChange={updateField}
                    placeholder="Escribe tu contraseña"
                    required
                  />

                  <button
                    type="button"
                    className="input-end-button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                  >
                    {showPassword
                      ? 'Ocultar'
                      : 'Ver'}
                  </button>
                </div>
              </div>

              {message && (
                <div className="platform-alert warning">
                  {message}
                </div>
              )}

              <button
                type="submit"
                className="platform-button platform-button-primary platform-button-large"
              >
                Iniciar sesión
              </button>
            </form>

            <div className="auth-divider">
              <span>
                Accesos de demostración
              </span>
            </div>

            <div className="auth-demo-grid">
              <button
                type="button"
                className="auth-demo-card"
                onClick={() =>
                  loginAsDemo('client')
                }
              >
                <PlatformIcon
                  name="book"
                  size={24}
                />

                <span>
                  <strong>
                    Campus del estudiante
                  </strong>
                  <small>
                    cliente@tamborito.org
                  </small>
                </span>
              </button>

              <button
                type="button"
                className="auth-demo-card"
                onClick={() =>
                  loginAsDemo('admin')
                }
              >
                <PlatformIcon
                  name="settings"
                  size={24}
                />

                <span>
                  <strong>
                    Panel administrativo
                  </strong>
                  <small>
                    admin@tamborito.org
                  </small>
                </span>
              </button>
            </div>

            <p className="auth-form-footer">
              ¿Todavía no tienes cuenta?{' '}
              <Link to="/registro">
                Crear una cuenta
              </Link>
            </p>
          </div>
        </section>
      </main>

      <FoundationFooter />
    </PageShell>
  );
}