import { useContext, createContext, useState } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

// Normalize user object: always produce a `roles` array (backwards compatible with `role`)
function normalizeUser(user) {
  if (!user) return null;
  if (user.roles) return user;
  if (user.role) {
    return { ...user, roles: [user.role] };
  }
  return user;
}

function getUserFromStorage() {
  try {
    const stored = localStorage.getItem('user');
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUserFromStorage());
  const [loading, setLoading] = useState(false);

  const handleAuthResponse = (data) => {
    const normalized = normalizeUser(data.user);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(normalized));
    setUser(normalized);
    return normalized;
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    return handleAuthResponse(data);
  };

  const register = async (userData) => {
    const data = await api.register(userData);
    return handleAuthResponse(data);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helper: check if user has a specific role
  const hasRole = (roleName) => {
    return user?.roles?.includes(roleName) ?? user?.role === roleName ?? false;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}