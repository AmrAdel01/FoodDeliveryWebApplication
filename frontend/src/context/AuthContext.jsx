import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import client from '../api/client.js';

const AuthContext = createContext(null);

function storedUser() {
  try { return JSON.parse(localStorage.getItem('food_user')); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storedUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('food_token')));

  const logout = () => {
    localStorage.removeItem('food_token');
    localStorage.removeItem('food_user');
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('food_token');
    if (!token) { setLoading(false); return undefined; }
    client.get('/auth/me').then(({ data }) => {
      setUser(data.data);
      localStorage.setItem('food_user', JSON.stringify(data.data));
    }).catch(logout).finally(() => setLoading(false));
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, []);

  const authenticate = async (mode, values) => {
    const { data } = await client.post(`/auth/${mode}`, values);
    localStorage.setItem('food_token', data.data.token);
    localStorage.setItem('food_user', JSON.stringify(data.data.user));
    setUser(data.data.user);
    return data.data.user;
  };

  const value = useMemo(() => ({ user, loading, login: (v) => authenticate('login', v), register: (v) => authenticate('register', v), logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
