import React, {
  createContext, useState, useEffect, useCallback,
} from 'react';
import PropTypes from 'prop-types';
import api from '../utils/api';

const AuthContext = createContext();

const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY || 'authToken';
const SESSION_TIMEOUT_MINUTES = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 30;

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token/session on mount
  useEffect(() => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    async function fetchUser() {
      try {
        const response = await api.get('/auth/me');
        if (response && response.data && response.data.user) {
          // Normalize role for consistent routing
          const normalizeRole = (role) => {
            const normalized = role.toLowerCase().trim();
            if (normalized === 'reception') return 'receptionist';
            if (normalized === 'lab technician') return 'labtech';
            return normalized;
          };
          
          const userData = {
            ...response.data.user,
            role: normalizeRole(response.data.user.role)
          };
          setUser(userData);
        } else {
          localStorage.removeItem(AUTH_TOKEN_KEY);
        }
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Save token to localStorage and set user after login
  const login = useCallback(async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (
        response
        && response.data
        && response.data.token
        && response.data.user
      ) {
        localStorage.setItem(AUTH_TOKEN_KEY, response.data.token);
        // Normalize role for consistent routing
        const normalizeRole = (role) => {
          const normalized = role.toLowerCase().trim();
          if (normalized === 'reception') return 'receptionist';
          if (normalized === 'lab technician') return 'labtech';
          return normalized;
        };
        
        const userData = {
          ...response.data.user,
          role: normalizeRole(response.data.user.role)
        };
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      return {
        success: false,
        message:
          error?.response?.data?.message
          || error.message
          || 'Login failed. Please check your credentials and try again.',
      };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
  }, []);

  // Auto logout on session timeout (optional)
  useEffect(() => {
    if (!user) return undefined;

    const interval = setInterval(() => {
      const lastActivity = Number(localStorage.getItem('lastActivity') || 0);
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT_MINUTES * 60 * 1000) {
        logout();
      }
    }, 60 * 1000);

    // Update lastActivity on user actions
    const updateLastActivity = () => localStorage.setItem('lastActivity', Date.now().toString());
    window.addEventListener('click', updateLastActivity);
    window.addEventListener('keydown', updateLastActivity);
    updateLastActivity();

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', updateLastActivity);
      window.removeEventListener('keydown', updateLastActivity);
    };
  }, [user, logout]);

  const value = React.useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext, AuthProvider };
