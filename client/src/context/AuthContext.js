// client/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  // Whenever token changes, fetch the current user profile
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      api.get('/profile')
        .then(res => setUser(res.data))
        .catch(() => {
          // if token invalid, clear and force login
          setToken(null);
          localStorage.removeItem('token');
          navigate('/login');
        });
    }
  }, [token, navigate]);

  // Login and redirect based on role
  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    const newToken = res.data.token;
    setToken(newToken);
    localStorage.setItem('token', newToken);
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    const profileRes = await api.get('/profile');
    setUser(profileRes.data);

    // Role-based home
    if (profileRes.data.role === 'admin') {
      navigate('/subjects');
    } else {
      navigate('/my-subjects');
    }
  };

  const register = async (username, password) => {
    // keep registration as-is (student by default)
    await api.post('/auth/register', { username, password, role: 'student' });
    navigate('/login');
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
