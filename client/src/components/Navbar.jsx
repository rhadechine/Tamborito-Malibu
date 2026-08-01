import { useState } from 'react';
import {
  Link,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import PlatformIcon from './PlatformIcon';

const ecosystemLinks = [
  {
    to: '/',
    label: 'Ecosistema',
  },
  {
    to: '/fundacion',
    label: 'Fundación',
  },
  {
    to: '/museo',
    label: 'Museo',
  },
  {
    to: '/donaciones',
    label: 'Donaciones',
  },
];

const foundationLinks = [
  {
    to: '/fundacion',
    label: 'Inicio',
  },
  {
    to: '/historia',
    label: 'Historia',
  },
  {
    to: '/cursos',
    label: 'Cursos',
  },
  {
    to: '/biblioteca',
    label: 'Biblioteca',
  },
  {
    to: '/donaciones',
    label: 'Donaciones',
  },
];

const museumLinks = [
  {
    to: '/museo',
    label: 'Inicio',
  },
  {
    to: '/museo/historia',
    label: 'Historia',
  },
  {
    to: '/museo/colecciones',
    label: 'Colecciones',
  },
  {
    to: '/museo/contactanos',
    label: 'Contáctanos',
  },
  {
    to: '/museo/donar',
    label: 'Donar',
  },
];

export default function Navbar({
  variant = 'foundation',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [accountOpen, setAccountOpen] =
    useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useCart();

  const isMuseum = variant === 'museum';
  const isEcosystem = variant === 'ecosystem';

  const links = isMuseum
    ? museumLinks
    : isEcosystem
      ? ecosystemLinks
      : foundationLinks;

  const logoPath = isMuseum
    ? '/museo'
    : isEcosystem
      ? '/'
      : '/fundacion';

  const logoText = isMuseum
    ? 'Museo Arqueológico'
    : isEcosystem
      ? 'Ecosistema Cultural'
      : 'Fundación';

  const logoAccent = isMuseum
    ? 'Malibú'
    : isEcosystem
      ? 'Tamborito & Malibú'
      : 'Tamborito';

  function closeMenus() {
    setIsOpen(false);
    setAccountOpen(false);
  }

  function handleLogout() {
    logout();
    closeMenus();
    navigate('/fundacion');
  }

  return (
    <nav
      className={[
        'navbar',
        isMuseum ? 'museo-nav' : '',
        isEcosystem
          ? 'ecosystem-nav'
          : 'solid',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="container nav-content">
        <Link
          to={logoPath}
          className={[
            'logo',
            isMuseum ? 'museo-logo' : '',
            isEcosystem
              ? 'ecosystem-logo'
              : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={closeMenus}
        >
          {logoText}{' '}
          <span>{logoAccent}</span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={
            isOpen
              ? 'Cerrar menú'
              : 'Abrir menú'
          }
          aria-expanded={isOpen}
          onClick={() =>
            setIsOpen((current) => !current)
          }
        >
          <PlatformIcon
            name={isOpen ? 'close' : 'menu'}
            size={27}
          />
        </button>

        <div
          className={[
            'nav-desktop-area',
            isOpen ? 'open' : '',
          ].join(' ')}
        >
          <ul className="nav-links">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={
                    link.to === '/' ||
                    link.to === '/fundacion' ||
                    link.to === '/museo'
                  }
                  onClick={closeMenus}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {!isMuseum && (
            <div className="nav-actions">
              <Link
                to="/carrito"
                className="nav-icon-action"
                onClick={closeMenus}
                aria-label={`Carrito con ${count} cursos`}
              >
                <PlatformIcon
                  name="cart"
                  size={20}
                />

                {count > 0 && (
                  <span className="nav-cart-count">
                    {count}
                  </span>
                )}
              </Link>

              {!user ? (
                <>
                  <Link
                    to="/login"
                    className="nav-login-link"
                    onClick={closeMenus}
                  >
                    Iniciar sesión
                  </Link>

                  <Link
                    to="/registro"
                    className="nav-cta"
                    onClick={closeMenus}
                  >
                    Crear cuenta
                  </Link>
                </>
              ) : (
                <div className="nav-account">
                  <button
                    type="button"
                    className="nav-account-button"
                    aria-expanded={accountOpen}
                    onClick={() =>
                      setAccountOpen(
                        (current) => !current,
                      )
                    }
                  >
                    <span className="nav-account-avatar">
                      {user.name
                        .split(' ')
                        .slice(0, 2)
                        .map(
                          (part) =>
                            part[0]?.toUpperCase(),
                        )
                        .join('')}
                    </span>

                    <span className="nav-account-copy">
                      <strong>{user.name}</strong>

                      <small>
                        {user.role === 'admin'
                          ? 'Administrador'
                          : 'Estudiante'}
                      </small>
                    </span>

                    <PlatformIcon
                      name="chevronDown"
                      size={16}
                    />
                  </button>

                  {accountOpen && (
                    <div className="nav-account-menu">
                      <Link
                        to={
                          user.role === 'admin'
                            ? '/admin'
                            : '/campus'
                        }
                        onClick={closeMenus}
                      >
                        <PlatformIcon
                          name="home"
                          size={18}
                        />
                        Mi panel
                      </Link>

                      {user.role === 'client' && (
                        <>
                          <Link
                            to="/campus/cursos"
                            onClick={closeMenus}
                          >
                            <PlatformIcon
                              name="book"
                              size={18}
                            />
                            Mis cursos
                          </Link>

                          <Link
                            to="/campus/perfil"
                            onClick={closeMenus}
                          >
                            <PlatformIcon
                              name="user"
                              size={18}
                            />
                            Mi perfil
                          </Link>
                        </>
                      )}

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
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}