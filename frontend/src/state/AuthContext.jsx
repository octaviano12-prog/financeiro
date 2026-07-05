import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((response) => setUser(response.data))
      .catch(() => localStorage.removeItem('gfi_token'))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('gfi_token', response.data.token);
    setUser(response.data.user);
  }

  async function register(payload) {
    const response = await api.post('/auth/register', payload);
    localStorage.setItem('gfi_token', response.data.token);
    setUser(response.data.user);
  }

  function logout() {
    localStorage.removeItem('gfi_token');
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
