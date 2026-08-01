import { useState } from 'react';
import PlatformIcon from '../../components/PlatformIcon';
import { useAuth } from '../../context/AuthContext';
import {
  formatDate,
  getInitials,
} from '../../utils/formatters';

export default function Profile() {
  const {
    user,
    updateProfile,
    changePassword,
  } = useAuth();

  const [profileForm, setProfileForm] =
    useState({
      name: user.name ?? '',
      phone: user.phone ?? '',
      city: user.city ?? '',
      bio: user.bio ?? '',
    });

  const [passwordForm, setPasswordForm] =
    useState({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });

  const [profileMessage, setProfileMessage] =
    useState(null);

  const [passwordMessage, setPasswordMessage] =
    useState(null);

  const [showPasswords, setShowPasswords] =
    useState(false);

  function updateProfileField(event) {
    const { name, value } = event.target;

    setProfileForm((current) => ({
      ...current,
      [name]: value,
    }));

    setProfileMessage(null);
  }

  function updatePasswordField(event) {
    const { name, value } = event.target;

    setPasswordForm((current) => ({
      ...current,
      [name]: value,
    }));

    setPasswordMessage(null);
  }

  function submitProfile(event) {
    event.preventDefault();

    if (profileForm.name.trim().length < 3) {
      setProfileMessage({
        type: 'warning',
        text: 'Escribe un nombre válido.',
      });
      return;
    }

    const result = updateProfile(profileForm);

    setProfileMessage({
      type: result.ok ? 'success' : 'warning',
      text: result.message,
    });
  }

  function submitPassword(event) {
    event.preventDefault();

    if (passwordForm.newPassword.length < 8) {
      setPasswordMessage({
        type: 'warning',
        text:
          'La nueva contraseña debe tener mínimo 8 caracteres.',
      });
      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordMessage({
        type: 'warning',
        text: 'Las contraseñas no coinciden.',
      });
      return;
    }

    const result = changePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
    );

    setPasswordMessage({
      type: result.ok ? 'success' : 'warning',
      text: result.message,
    });

    if (result.ok) {
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }

  return (
    <div className="student-profile-page">
      <section className="student-page-header">
        <div>
          <p className="student-page-eyebrow">
            Cuenta del estudiante
          </p>

          <h2>Mi perfil</h2>

          <p>
            Actualiza tu información personal y las
            credenciales de acceso.
          </p>
        </div>
      </section>

      <section className="student-profile-summary">
        <div className="student-profile-large-avatar">
          {getInitials(user.name)}
        </div>

        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>

          <div>
            <span>Estudiante</span>
            <span>
              Cuenta activa desde{' '}
              {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </section>

      <div className="student-profile-layout">
        <form
          className="student-profile-form-card"
          onSubmit={submitProfile}
        >
          <div className="student-profile-form-heading">
            <div>
              <PlatformIcon name="user" size={24} />
            </div>

            <span>
              <h3>Información personal</h3>
              <p>
                Estos datos se utilizarán en
                inscripciones y certificados.
              </p>
            </span>
          </div>

          <div className="student-profile-field-grid">
            <div className="platform-field full">
              <label htmlFor="profile-name">
                Nombre completo
              </label>

              <input
                id="profile-name"
                name="name"
                type="text"
                value={profileForm.name}
                onChange={updateProfileField}
                required
              />
            </div>

            <div className="platform-field">
              <label htmlFor="profile-email">
                Correo electrónico
              </label>

              <input
                id="profile-email"
                type="email"
                value={user.email}
                disabled
              />

              <small>
                El cambio de correo requerirá
                verificación desde el backend.
              </small>
            </div>

            <div className="platform-field">
              <label htmlFor="profile-phone">
                Teléfono
              </label>

              <input
                id="profile-phone"
                name="phone"
                type="tel"
                value={profileForm.phone}
                onChange={updateProfileField}
                placeholder="300 000 0000"
              />
            </div>

            <div className="platform-field full">
              <label htmlFor="profile-city">
                Ciudad o municipio
              </label>

              <input
                id="profile-city"
                name="city"
                type="text"
                value={profileForm.city}
                onChange={updateProfileField}
                placeholder="Zambrano, Bolívar"
              />
            </div>

            <div className="platform-field full">
              <label htmlFor="profile-bio">
                Presentación
              </label>

              <textarea
                id="profile-bio"
                name="bio"
                rows="5"
                value={profileForm.bio}
                onChange={updateProfileField}
                placeholder="Cuéntanos brevemente sobre tus intereses culturales."
              />
            </div>
          </div>

          {profileMessage && (
            <div
              className={[
                'platform-alert',
                profileMessage.type,
              ].join(' ')}
            >
              {profileMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="platform-button platform-button-primary"
          >
            Guardar cambios
          </button>
        </form>

        <form
          className="student-profile-form-card"
          onSubmit={submitPassword}
        >
          <div className="student-profile-form-heading">
            <div>
              <PlatformIcon name="lock" size={24} />
            </div>

            <span>
              <h3>Seguridad</h3>
              <p>
                Cambia la contraseña utilizada para
                ingresar al campus.
              </p>
            </span>
          </div>

          <div className="student-profile-password-fields">
            <div className="platform-field">
              <label htmlFor="currentPassword">
                Contraseña actual
              </label>

              <input
                id="currentPassword"
                name="currentPassword"
                type={
                  showPasswords ? 'text' : 'password'
                }
                value={
                  passwordForm.currentPassword
                }
                onChange={updatePasswordField}
                required
              />
            </div>

            <div className="platform-field">
              <label htmlFor="newPassword">
                Nueva contraseña
              </label>

              <input
                id="newPassword"
                name="newPassword"
                type={
                  showPasswords ? 'text' : 'password'
                }
                value={passwordForm.newPassword}
                onChange={updatePasswordField}
                placeholder="Mínimo 8 caracteres"
                required
              />
            </div>

            <div className="platform-field">
              <label htmlFor="confirmPassword">
                Confirmar contraseña
              </label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type={
                  showPasswords ? 'text' : 'password'
                }
                value={
                  passwordForm.confirmPassword
                }
                onChange={updatePasswordField}
                required
              />
            </div>
          </div>

          <label className="platform-checkbox">
            <input
              type="checkbox"
              checked={showPasswords}
              onChange={(event) =>
                setShowPasswords(
                  event.target.checked,
                )
              }
            />

            <span>Mostrar contraseñas</span>
          </label>

          {passwordMessage && (
            <div
              className={[
                'platform-alert',
                passwordMessage.type,
              ].join(' ')}
            >
              {passwordMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="platform-button platform-button-dark"
          >
            Actualizar contraseña
          </button>

          <div className="student-security-note">
            <PlatformIcon name="lock" size={19} />

            <p>
              Las contraseñas se guardan en
              localStorage únicamente durante esta
              demostración. Django deberá almacenarlas
              cifradas mediante su sistema de
              autenticación.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}