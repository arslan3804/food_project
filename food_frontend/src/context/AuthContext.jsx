import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await api.post('/jwt/create/', { username, password });
      console.log('Отправка запроса на /jwt/create/ с данными:', { username, password });
      localStorage.setItem('access', response.data.access);
      localStorage.setItem('refresh', response.data.refresh);
      setUser({ username });
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await api.post('/users/', { username, password });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.response?.data };
    }
  };

  const logout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    setUser(null);
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('access');
    if (token && !user) {
      try {
        const response = await api.get('/users/me/');
      setUser({ username: response.data.username });
      } catch (error) {
        console.log('Error...');
        logout();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, checkAuth, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
