import { useState } from 'react';
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import PlatformIcon from './PlatformIcon';
import { useAuth } from '../context/AuthContext';
import { usePlatform } from '../context/PlatformContext';
import { formatDate, getInitials } from '../utils/formatters';

const studentLinks = [
  {
    to: '/campus',
    label: 'Inicio',
    icon: 'home',
    end: true,
  },
  {
    to: '/campus/cursos',
    label: 'Mis cursos',
    icon: 'book',
  },
  {
    to: '/campus/certificados',
    label: 'Certificados',
    icon: 'certificate',
  },
  {
    to: '/campus/compras',
    label: 'Compras',
    icon: 'orders',
  },
  {
    to: '/campus/perfil',
    label: 'Mi perfil',
    icon: 'user',
  },
];

function getPageTitle(pathname) {
  if (pathname.includes('/clase/')) {
    return 'Reproductor de clase';
  }

  if (
    pathname.startsWith('/campus/cursos/') &&
    pathname !== '/campus/cursos'
  ) {
    return 'Espacio del curso';
  }

  if (pathname === '/campus/cursos') {
    return 'Mis cursos';
  }

  if (pathname === '/campus/certificados') {
    return 'Certificados';
  }

  if (pathname === '/campus/compras') {
    return 'Compras';
  }

  if (pathname === '/campus/perfil') {
    return 'Mi perfil';
  }

  return 'Resumen de aprendizaje';
}

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const {
    getUserNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = usePlatform();

  const notifications = getUserNotifications(user.id);
  const unreadCount = notifications.filter(
    (notification) => !notification.read,
  ).length;

  const pageTitle = getPageTitle(location.pathname);

  function closeMenus() {
    setSidebarOpen(false);
    setNotificationsOpen(false);
    setProfileOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenus();
    navigate('/fundacion');
  }

  function openNotifications() {
    setNotificationsOpen((current) => !current);
    setProfileOpen(false);
  }

  function openProfileMenu() {
    setProfileOpen((current) => !current);
    setNotificationsOpen(false);
  }

  return (
    <div className="student-platform">
      <aside
        className={[
          'student-platform-sidebar',
          sidebarOpen ? 'open' : '',
        ].join(' ')}
      >
        <div className="student-sidebar-brand">
          <Link to="/fundacion" onClick={closeMenus}>
            Fundación <span>Tamborito</span>
          </Link>

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          >
            <PlatformIcon name="close" size={22} />
          </button>
        </div>

        <div className="student-sidebar-account">
          <div className="student-sidebar-avatar">
            {getInitials(user.name)}
          </div>

          <div>
            <strong>{user.name}</strong>
            <span>Estudiante</span>
          </div>
        </div>

        <nav className="student-sidebar-navigation">
          <p>Campus</p>

          <ul>
            {studentLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={closeMenus}
                >
                  <PlatformIcon name={link.icon} size={20} />
                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="student-sidebar-secondary">
          <p>Explorar</p>

          <Link to="/cursos" onClick={closeMenus}>
            <PlatformIcon name="search" size={20} />
            Catálogo de cursos
          </Link>

          <Link to="/biblioteca" onClick={closeMenus}>
            <PlatformIcon name="book" size={20} />
            Biblioteca
          </Link>

          <Link to="/fundacion" onClick={closeMenus}>
            <PlatformIcon name="external" size={20} />
            Sitio de la fundación
          </Link>
        </div>

        <button
          type="button"
          className="student-sidebar-logout"
          onClick={handleLogout}
        >
          <PlatformIcon name="logout" size={20} />
          Cerrar sesión
        </button>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="student-sidebar-backdrop"
          aria-label="Cerrar menú lateral"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="student-platform-main">
        <header className="student-platform-topbar">
          <div className="student-topbar-left">
            <button
              type="button"
              className="student-mobile-menu"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
            >
              <PlatformIcon name="menu" size={24} />
            </button>

            <div>
              <span>Campus Tamborito</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="student-topbar-actions">
            <Link
              to="/cursos"
              className="student-explore-button"
            >
              <PlatformIcon name="search" size={18} />
              Explorar cursos
            </Link>

            <div className="student-topbar-dropdown">
              <button
                type="button"
                className="student-topbar-icon"
                aria-label="Notificaciones"
                aria-expanded={notificationsOpen}
                onClick={openNotifications}
              >
                <PlatformIcon name="bell" size={21} />

                {unreadCount > 0 && (
                  <span>{unreadCount}</span>
                )}
              </button>

              {notificationsOpen && (
                <div className="student-notifications-menu">
                  <div className="student-dropdown-heading">
                    <div>
                      <strong>Notificaciones</strong>
                      <span>
                        {unreadCount} sin leer
                      </span>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          markAllNotificationsRead(user.id)
                        }
                      >
                        Marcar todas
                      </button>
                    )}
                  </div>

                  <div className="student-notification-list">
                    {notifications.length === 0 ? (
                      <div className="student-dropdown-empty">
                        No tienes notificaciones.
                      </div>
                    ) : (
                      notifications.slice(0, 6).map(
                        (notification) => (
                          <button
                            type="button"
                            key={notification.id}
                            className={[
                              'student-notification-item',
                              notification.read
                                ? ''
                                : 'unread',
                            ].join(' ')}
                            onClick={() =>
                              markNotificationRead(
                                notification.id,
                              )
                            }
                          >
                            <div>
                              <PlatformIcon
                                name={
                                  notification.type ===
                                  'certificate'
                                    ? 'certificate'
                                    : notification.type ===
                                        'order'
                                      ? 'orders'
                                      : 'book'
                                }
                                size={19}
                              />
                            </div>

                            <span>
                              <strong>
                                {notification.title}
                              </strong>
                              <p>
                                {notification.message}
                              </p>
                              <small>
                                {formatDate(
                                  notification.createdAt,
                                  {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  },
                                )}
                              </small>
                            </span>
                          </button>
                        ),
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="student-topbar-dropdown">
              <button
                type="button"
                className="student-profile-button"
                aria-expanded={profileOpen}
                onClick={openProfileMenu}
              >
                <span>{getInitials(user.name)}</span>

                <div>
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>

                <PlatformIcon
                  name="chevronDown"
                  size={17}
                />
              </button>

              {profileOpen && (
                <div className="student-profile-menu">
                  <Link
                    to="/campus/perfil"
                    onClick={closeMenus}
                  >
                    <PlatformIcon name="user" size={18} />
                    Mi perfil
                  </Link>

                  <Link
                    to="/campus/compras"
                    onClick={closeMenus}
                  >
                    <PlatformIcon name="orders" size={18} />
                    Mis compras
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <PlatformIcon name="logout" size={18} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="student-platform-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}