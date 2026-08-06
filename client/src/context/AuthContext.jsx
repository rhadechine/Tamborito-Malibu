import {
  createContext,
  useContext,
  useMemo,
  useState,
} from 'react';
import { seedUsers } from '../data/platformSeed';

const USERS_KEY = 'tamborito.users.v3';
const SESSION_KEY = 'tamborito.session.v3';

function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createInitialUsers() {
  const users = readJson(USERS_KEY, null);

  if (users) {
    return users;
  }

  localStorage.setItem(
    USERS_KEY,
    JSON.stringify(seedUsers),
  );

  return seedUsers;
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(createInitialUsers);

  const [session, setSession] = useState(() =>
    readJson(SESSION_KEY, null),
  );

  const user = useMemo(
    () =>
      users.find(
        (item) => item.id === session?.userId,
      ) ?? null,
    [session, users],
  );

  function persistUsers(nextUsers) {
    setUsers(nextUsers);

    localStorage.setItem(
      USERS_KEY,
      JSON.stringify(nextUsers),
    );
  }

  function login(email, password) {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const foundUser = users.find(
      (item) =>
        item.email.toLowerCase() === normalizedEmail &&
        item.password === password,
    );

    if (!foundUser) {
      return {
        ok: false,
        message:
          'El correo o la contraseña no son correctos.',
      };
    }

    if (foundUser.status !== 'active') {
      return {
        ok: false,
        message:
          'Esta cuenta se encuentra inactiva. Contacta al administrador.',
      };
    }

    const nextSession = {
      userId: foundUser.id,
      createdAt: new Date().toISOString(),
    };

    setSession(nextSession);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(nextSession),
    );

    return {
      ok: true,
      user: foundUser,
    };
  }

  function register({
    name,
    email,
    password,
    phone = '',
    city = '',
  }) {
    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const exists = users.some(
      (item) =>
        item.email.toLowerCase() === normalizedEmail,
    );

    if (exists) {
      return {
        ok: false,
        message:
          'Ya existe una cuenta registrada con ese correo.',
      };
    }

    const nextUser = {
      id: `usr-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: 'client',
      status: 'active',
      phone: phone.trim(),
      city: city.trim(),
      bio: '',
      createdAt: new Date().toISOString(),
    };

    const nextUsers = [...users, nextUser];

    persistUsers(nextUsers);

    const nextSession = {
      userId: nextUser.id,
      createdAt: new Date().toISOString(),
    };

    setSession(nextSession);

    localStorage.setItem(
      SESSION_KEY,
      JSON.stringify(nextSession),
    );

    return {
      ok: true,
      user: nextUser,
    };
  }

  function logout() {
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }

  function updateProfile(values) {
    if (!user) {
      return {
        ok: false,
        message: 'No hay una sesión activa.',
      };
    }

    const nextUsers = users.map((item) =>
      item.id === user.id
        ? {
            ...item,
            name: values.name.trim(),
            phone: values.phone.trim(),
            city: values.city.trim(),
            bio: values.bio.trim(),
          }
        : item,
    );

    persistUsers(nextUsers);

    return {
      ok: true,
      message: 'Perfil actualizado correctamente.',
    };
  }

  function changePassword(
    currentPassword,
    newPassword,
  ) {
    if (!user) {
      return {
        ok: false,
        message: 'No hay una sesión activa.',
      };
    }

    if (user.password !== currentPassword) {
      return {
        ok: false,
        message:
          'La contraseña actual no coincide.',
      };
    }

    const nextUsers = users.map((item) =>
      item.id === user.id
        ? {
            ...item,
            password: newPassword,
          }
        : item,
    );

    persistUsers(nextUsers);

    return {
      ok: true,
      message: 'Contraseña actualizada.',
    };
  }

  function toggleUserStatus(userId) {
    const nextUsers = users.map((item) =>
      item.id === userId
        ? {
            ...item,
            status:
              item.status === 'active'
                ? 'inactive'
                : 'active',
          }
        : item,
    );

    persistUsers(nextUsers);
  }

  function resetDemoUsers() {
    persistUsers(seedUsers);
    setSession(null);
    localStorage.removeItem(SESSION_KEY);
  }

  const value = {
    user,
    users,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isClient: user?.role === 'client',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    toggleUserStatus,
    resetDemoUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider.',
    );
  }

  return context;
}