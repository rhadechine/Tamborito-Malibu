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
import { getInitials } from '../utils/formatters';

const adminLinks = [
  {
    to: '/admin',
    label: 'Resumen',
    icon: 'home',
    end: true,
  },
  {
    to: '/admin/cursos',
    label: 'Cursos',
    icon: 'book',
  },
  {
    to: '/admin/estudiantes',
    label: 'Estudiantes',
    icon: 'users',
  },
  {
    to: '/admin/inscripciones',
    label: 'Inscripciones',
    icon: 'lessons',
  },
  {
    to: '/admin/ventas',
    label: 'Ventas y pagos',
    icon: 'orders',
  },
  {
    to: '/admin/reportes',
    label: 'Reportes',
    icon: 'chart',
  },
  {
    to: '/admin/configuracion',
    label: 'Configuración',
    icon: 'settings',
  },
];

function getAdminPageTitle(pathname) {
  if (pathname === '/admin/cursos/nuevo') {
    return 'Crear curso';
  }

  if (
    pathname.startsWith('/admin/cursos/') &&
    pathname.endsWith('/editar')
  ) {
    return 'Editar curso';
  }

  if (pathname === '/admin/cursos') {
    return 'Gestión de cursos';
  }

  if (pathname === '/admin/estudiantes') {
    return 'Gestión de estudiantes';
  }

  if (pathname === '/admin/inscripciones') {
    return 'Inscripciones';
  }

  if (pathname === '/admin/ventas') {
    return 'Ventas y pagos';
  }

  if (pathname === '/admin/reportes') {
    return 'Reportes';
  }

  if (pathname === '/admin/configuracion') {
    return 'Configuración';
  }

  return 'Panel administrativo';
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const pageTitle = getAdminPageTitle(location.pathname);

  function closeMenus() {
    setSidebarOpen(false);
    setProfileOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenus();
    navigate('/fundacion');
  }

  return (
    <div className="admin-platform">
      <aside
        className={[
          'admin-sidebar',
          sidebarOpen ? 'open' : '',
        ].join(' ')}
      >
        <div className="admin-sidebar-brand">
          <Link to="/admin" onClick={closeMenus}>
            <span className="admin-brand-symbol">FT</span>

            <span>
              <strong>Fundación Tamborito</strong>
              <small>Administración</small>
            </span>
          </Link>

          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setSidebarOpen(false)}
          >
            <PlatformIcon name="close" size={22} />
          </button>
        </div>

        <nav className="admin-sidebar-navigation">
          <p>Gestión</p>

          <ul>
            {adminLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.end}
                  onClick={closeMenus}
                >
                  <PlatformIcon
                    name={link.icon}
                    size={20}
                  />

                  <span>{link.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar-secondary">
          <p>Accesos rápidos</p>

          <Link to="/admin/cursos/nuevo">
            <PlatformIcon name="plus" size={20} />
            Crear curso
          </Link>

          <Link to="/cursos" target="_blank">
            <PlatformIcon name="external" size={20} />
            Ver catálogo público
          </Link>

          <Link to="/fundacion" target="_blank">
            <PlatformIcon name="external" size={20} />
            Ver sitio Fundación
          </Link>
        </div>

        <div className="admin-sidebar-account">
          <span>{getInitials(user.name)}</span>

          <div>
            <strong>{user.name}</strong>
            <small>{user.email}</small>
          </div>
        </div>

        <button
          type="button"
          className="admin-sidebar-logout"
          onClick={handleLogout}
        >
          <PlatformIcon name="logout" size={20} />
          Cerrar sesión
        </button>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Cerrar menú lateral"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-title">
            <button
              type="button"
              className="admin-mobile-menu"
              aria-label="Abrir menú"
              onClick={() => setSidebarOpen(true)}
            >
              <PlatformIcon name="menu" size={24} />
            </button>

            <div>
              <span>Panel administrativo</span>
              <h1>{pageTitle}</h1>
            </div>
          </div>

          <div className="admin-topbar-actions">
            <Link
              to="/admin/cursos/nuevo"
              className="platform-button platform-button-primary"
            >
              <PlatformIcon name="plus" size={18} />
              Nuevo curso
            </Link>

            <div className="admin-profile-dropdown">
              <button
                type="button"
                className="admin-profile-button"
                aria-expanded={profileOpen}
                onClick={() =>
                  setProfileOpen((current) => !current)
                }
              >
                <span>{getInitials(user.name)}</span>

                <div>
                  <strong>{user.name}</strong>
                  <small>Administrador</small>
                </div>

                <PlatformIcon
                  name="chevronDown"
                  size={17}
                />
              </button>

              {profileOpen && (
                <div className="admin-profile-menu">
                  <Link
                    to="/admin/configuracion"
                    onClick={closeMenus}
                  >
                    <PlatformIcon
                      name="settings"
                      size={18}
                    />
                    Configuración
                  </Link>

                  <Link
                    to="/fundacion"
                    onClick={closeMenus}
                  >
                    <PlatformIcon
                      name="external"
                      size={18}
                    />
                    Ver sitio
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                  >
                    <PlatformIcon
                      name="logout"
                      size={18}
                    />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}