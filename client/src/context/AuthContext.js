import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setToken as setAuthHeader } from '../api/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [user, setUser]       = useState(null);
  const navigate               = useNavigate();

  const login = async (username, password) => {
    // zatraži JWT od backenda
    const { data } = await api.post('/auth/login', { username, password });
    const jwt      = data.token;

    // sačuvaj ga u state i u default header za buduće pozive
    setTokenState(jwt);
    setAuthHeader(jwt);

    // dekodiraj payload iz JWT da znaš role i userId
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    setUser({ userId: payload.userId, role: payload.role });

    // preusmeri na početnu stranu
    navigate('/');
  };

  const register = (username, password) => {
    // vraća Promise pa možeš .then ili await
    return api.post('/auth/register', { username, password });
  };

  const logout = () => {
    setTokenState(null);
    setAuthHeader(null);
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
