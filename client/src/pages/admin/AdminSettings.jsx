import { useState } from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';

export default function AdminSettings() {
  const {
    resetDemoUsers,
  } = useAuth();

  const {
    settings,
    updatePlatformSettings,
    resetPlatformData,
  } = usePlatform();

  const [form, setForm] = useState({
    ...settings,
  });

  const [message, setMessage] =
    useState(null);

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

    setMessage(null);
  }

  function submitSettings(event) {
    event.preventDefault();

    updatePlatformSettings(form);

    setMessage({
      type: 'success',
      text:
        'Configuración actualizada correctamente.',
    });
  }

  function restorePlatform() {
    const accepted = window.confirm(
      '¿Restaurar todos los cursos, inscripciones, ventas, certificados y notificaciones de demostración?',
    );

    if (!accepted) {
      return;
    }

    resetPlatformData();
    setForm({
      ...settings,
    });

    setMessage({
      type: 'success',
      text:
        'Los datos académicos fueron restaurados.',
    });
  }

  function restoreUsers() {
    const accepted = window.confirm(
      'Esta acción cerrará la sesión y restaurará todos los usuarios de prueba. ¿Continuar?',
    );

    if (!accepted) {
      return;
    }

    resetDemoUsers();
    window.location.href = '/login';
  }

  return (
    <div className="admin-settings-page">
      <section className="admin-page-intro">
        <div>
          <p className="admin-page-eyebrow">
            Parámetros generales
          </p>

          <h2>
            Configuración de la plataforma
          </h2>

          <p>
            Administra información institucional,
            pagos, registros y funcionalidades
            del campus.
          </p>
        </div>
      </section>

      <form
        className="admin-settings-layout"
        onSubmit={submitSettings}
      >
        <div className="admin-settings-main">
          <article className="admin-form-card">
            <div className="admin-form-heading">
              <h3>Información institucional</h3>
              <p>
                Datos mostrados en comunicaciones
                y áreas de soporte.
              </p>
            </div>

            <div className="admin-form-grid">
              <div className="platform-field full">
                <label htmlFor="organizationName">
                  Nombre de la organización
                </label>

                <input
                  id="organizationName"
                  name="organizationName"
                  value={form.organizationName}
                  onChange={updateField}
                />
              </div>

              <div className="platform-field">
                <label htmlFor="supportEmail">
                  Correo de soporte
                </label>

                <input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  value={form.supportEmail}
                  onChange={updateField}
                />
              </div>

              <div className="platform-field">
                <label htmlFor="supportPhone">
                  Teléfono de soporte
                </label>

                <input
                  id="supportPhone"
                  name="supportPhone"
                  value={form.supportPhone}
                  onChange={updateField}
                />
              </div>
            </div>
          </article>

          <article className="admin-form-card">
            <div className="admin-form-heading">
              <h3>Pagos y moneda</h3>
            </div>

            <div className="admin-form-grid">
              <div className="platform-field">
                <label htmlFor="currency">
                  Moneda
                </label>

                <select
                  id="currency"
                  name="currency"
                  value={form.currency}
                  onChange={updateField}
                >
                  <option value="COP">
                    Peso colombiano
                  </option>
                </select>
              </div>

              <div className="platform-field">
                <label htmlFor="defaultPaymentMethod">
                  Método predeterminado
                </label>

                <select
                  id="defaultPaymentMethod"
                  name="defaultPaymentMethod"
                  value={
                    form.defaultPaymentMethod
                  }
                  onChange={updateField}
                >
                  <option value="PSE">
                    PSE
                  </option>
                  <option value="Tarjeta">
                    Tarjeta
                  </option>
                </select>
              </div>
            </div>
          </article>

          <article className="admin-form-card">
            <div className="admin-form-heading">
              <h3>Funciones del sistema</h3>
            </div>

            <div className="admin-switch-list">
              <label>
                <span>
                  <strong>
                    Registro público
                  </strong>
                  <small>
                    Permitir que nuevos
                    estudiantes creen una
                    cuenta.
                  </small>
                </span>

                <input
                  type="checkbox"
                  name="publicRegistration"
                  checked={
                    form.publicRegistration
                  }
                  onChange={updateField}
                />
              </label>

              <label>
                <span>
                  <strong>
                    Certificados
                  </strong>
                  <small>
                    Habilitar emisión de
                    certificados al completar
                    cursos.
                  </small>
                </span>

                <input
                  type="checkbox"
                  name="certificatesEnabled"
                  checked={
                    form.certificatesEnabled
                  }
                  onChange={updateField}
                />
              </label>

              <label>
                <span>
                  <strong>
                    Modo mantenimiento
                  </strong>
                  <small>
                    Restringir temporalmente el
                    acceso público.
                  </small>
                </span>

                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={
                    form.maintenanceMode
                  }
                  onChange={updateField}
                />
              </label>
            </div>
          </article>

          {message && (
            <div
              className={[
                'platform-alert',
                message.type,
              ].join(' ')}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="platform-button platform-button-primary"
          >
            Guardar configuración
          </button>
        </div>

        <aside className="admin-settings-sidebar">
          <article className="admin-form-card">
            <div className="admin-form-heading">
              <h3>Estado del entorno</h3>
            </div>

            <ul className="admin-environment-list">
              <li>
                <span>Frontend</span>
                <strong>React + Vite</strong>
              </li>

              <li>
                <span>Estilos</span>
                <strong>Tailwind + CSS</strong>
              </li>

              <li>
                <span>Datos actuales</span>
                <strong>localStorage</strong>
              </li>

              <li>
                <span>Backend futuro</span>
                <strong>Django REST</strong>
              </li>

              <li>
                <span>Base de datos</span>
                <strong>PostgreSQL</strong>
              </li>
            </ul>
          </article>

          <article className="admin-form-card admin-danger-zone">
            <div className="admin-form-heading">
              <h3>Datos de demostración</h3>

              <p>
                Restaura el contenido inicial si
                realizaste cambios durante las
                pruebas.
              </p>
            </div>

            <button
              type="button"
              onClick={restorePlatform}
            >
              Restaurar datos académicos
            </button>

            <button
              type="button"
              onClick={restoreUsers}
            >
              Restaurar usuarios
            </button>
          </article>

          <article className="admin-form-card admin-backend-note">
            <PlatformIcon
              name="settings"
              size={28}
            />

            <h3>Próxima etapa</h3>

            <p>
              Django reemplazará localStorage y
              manejará autenticación, permisos,
              pagos, archivos, progreso y
              auditoría.
            </p>
          </article>
        </aside>
      </form>
    </div>
  );
}