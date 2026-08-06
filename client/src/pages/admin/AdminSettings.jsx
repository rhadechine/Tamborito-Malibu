import { useEffect, useState } from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import { usePlatform } from '../../context/PlatformContext';

export default function AdminSettings() {
  const { resetDemoUsers } = useAuth();
  const {
    settings,
    updatePlatformSettings,
    resetPlatformData,
  } = usePlatform();

  const [form, setForm] = useState({ ...settings });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    setForm({ ...settings });
  }, [settings]);

  function updateField(event) {
    const { name, value, type, checked } = event.target;

    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }));

    setMessage(null);
  }

  function submitSettings(event) {
    event.preventDefault();
    updatePlatformSettings(form);
    setMessage({
      type: 'success',
      text: 'Configuración actualizada correctamente.',
    });
  }

  function restorePlatform() {
    const accepted = window.confirm(
      '¿Restaurar cursos, inscripciones, reportes, certificados, notificaciones y configuración de demostración?',
    );

    if (!accepted) {
      return;
    }

    resetPlatformData();
    setMessage({
      type: 'success',
      text: 'Los datos de demostración fueron restaurados.',
    });
  }

  function restoreUsers() {
    const accepted = window.confirm(
      'Esta acción cerrará la sesión y restaurará los usuarios de prueba. ¿Continuar?',
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
          <p className="admin-page-eyebrow">Configuración</p>
          <h2>Parámetros útiles del sistema</h2>
          <p>
            Ajusta datos operativos, atención al usuario, pagos, evidencias y
            enlaces legales sin modificar el nombre de la organización.
          </p>
        </div>
      </section>

      <form className="admin-settings-layout" onSubmit={submitSettings}>
        <div className="admin-settings-main">
          <article className="admin-form-card">
            <div className="admin-form-heading">
              <h3>Atención y soporte</h3>
              <p>
                Información que permite orientar a estudiantes, compradores y
                donantes cuando necesiten ayuda.
              </p>
            </div>

            <div className="admin-form-grid">
              <div className="platform-field">
                <label htmlFor="supportEmail">Correo de soporte</label>
                <input
                  id="supportEmail"
                  name="supportEmail"
                  type="email"
                  value={form.supportEmail || ''}
                  onChange={updateField}
                />
              </div>

              <div className="platform-field">
                <label htmlFor="supportPhone">Teléfono de soporte</label>
                <input
                  id="supportPhone"
                  name="supportPhone"
                  value={form.supportPhone || ''}
                  onChange={updateField}
                />
              </div>

              <div className="platform-field">
                <label htmlFor="businessHours">Horario de atención</label>
                <input
                  id="businessHours"
                  name="businessHours"
                  value={form.businessHours || ''}
                  onChange={updateField}
                  placeholder="Lunes a viernes, 8:00 a.m. - 5:00 p.m."
                />
              </div>

              <div className="platform-field">
                <label htmlFor="evidenceEmail">Correo para evidencias</label>
                <input
                  id="evidenceEmail"
                  name="evidenceEmail"
                  type="email"
                  value={form.evidenceEmail || ''}
                  onChange={updateField}
                  placeholder="academico@tamborito.org"
                />
              </div>
            </div>
          </article>

          <article className="admin-form-card">
            <div className="admin-form-heading">
              <h3>Pagos y donaciones</h3>
              <p>
                Parámetros visibles durante compras de cursos, comprobantes y
                donaciones.
              </p>
            </div>

            <div className="admin-form-grid">
              <div className="platform-field">
                <label htmlFor="currency">Moneda</label>
                <select
                  id="currency"
                  name="currency"
                  value={form.currency || 'COP'}
                  onChange={updateField}
                >
                  <option value="COP">Peso colombiano</option>
                </select>
              </div>

              <div className="platform-field">
                <label htmlFor="defaultPaymentMethod">
                  Método predeterminado
                </label>
                <select
                  id="defaultPaymentMethod"
                  name="defaultPaymentMethod"
                  value={form.defaultPaymentMethod || 'PSE'}
                  onChange={updateField}
                >
                  <option value="PSE">PSE</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div className="platform-field full">
                <label htmlFor="donationMessage">Mensaje para donantes</label>
                <textarea
                  id="donationMessage"
                  name="donationMessage"
                  rows="4"
                  value={form.donationMessage || ''}
                  onChange={updateField}
                  placeholder="Texto breve que explique el destino cultural de los aportes."
                />
              </div>
            </div>
          </article>

          <article className="admin-form-card">
            <div className="admin-form-heading">
              <h3>Legal y acceso</h3>
              <p>
                Enlaces y reglas operativas necesarias para mantener claridad
                frente a visitantes y usuarios registrados.
              </p>
            </div>

            <div className="admin-form-grid">
              <div className="platform-field full">
                <label htmlFor="privacyPolicyUrl">
                  Enlace de políticas de privacidad
                </label>
                <input
                  id="privacyPolicyUrl"
                  name="privacyPolicyUrl"
                  value={form.privacyPolicyUrl || '/politicas-privacidad'}
                  onChange={updateField}
                />
              </div>
            </div>

            <div className="admin-switch-list admin-useful-switches">
              <label>
                <span>
                  <strong>Registro público</strong>
                  <small>
                    Permite que nuevos estudiantes creen cuenta desde el sitio.
                  </small>
                </span>
                <input
                  type="checkbox"
                  name="publicRegistration"
                  checked={Boolean(form.publicRegistration)}
                  onChange={updateField}
                />
              </label>

              <label>
                <span>
                  <strong>Certificado del curso</strong>
                  <small>
                    Mantiene disponible la emisión de certificados cuando el
                    curso lo permita.
                  </small>
                </span>
                <input
                  type="checkbox"
                  name="certificatesEnabled"
                  checked={Boolean(form.certificatesEnabled)}
                  onChange={updateField}
                />
              </label>

              <label>
                <span>
                  <strong>Modo mantenimiento</strong>
                  <small>
                    Úsalo solo si se requiere ocultar temporalmente el acceso
                    público durante ajustes importantes.
                  </small>
                </span>
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={Boolean(form.maintenanceMode)}
                  onChange={updateField}
                />
              </label>
            </div>
          </article>

          {message && (
            <div className={['platform-alert', message.type].join(' ')}>
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
              <h3>Datos fijos</h3>
              <p>
                El nombre institucional no se edita desde aquí para evitar
                cambios accidentales en la identidad del proyecto.
              </p>
            </div>

            <ul className="admin-environment-list">
              <li>
                <span>Organización</span>
                <strong>Fundación Tamborito</strong>
              </li>
              <li>
                <span>Pasarela prioritaria</span>
                <strong>PSE</strong>
              </li>
              <li>
                <span>Modalidad cursos</span>
                <strong>Virtual</strong>
              </li>
              <li>
                <span>Duración</span>
                <strong>Horas</strong>
              </li>
            </ul>
          </article>

          <article className="admin-form-card admin-danger-zone">
            <div className="admin-form-heading">
              <h3>Datos de demostración</h3>
              <p>
                Restaura el contenido inicial si realizaste cambios durante las
                pruebas locales.
              </p>
            </div>

            <button type="button" onClick={restorePlatform}>
              Restaurar datos del sistema
            </button>

            <button type="button" onClick={restoreUsers}>
              Restaurar usuarios
            </button>
          </article>

          <article className="admin-form-card admin-backend-note">
            <PlatformIcon name="settings" size={28} />
            <h3>Próxima etapa</h3>
            <p>
              Django REST reemplazará localStorage para manejar autenticación,
              permisos, pagos, archivos, progreso y auditoría.
            </p>
          </article>
        </aside>
      </form>
    </div>
  );
}