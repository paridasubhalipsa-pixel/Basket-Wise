import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.success && res.data.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, pass) => {
    try {
      const res = await api.post('/auth/login', {
        email,
        password: pass,
      });

      if (res.success && res.data.user) {
        setUser(res.data.user);
        api.setToken(res.data.token);
        return { success: true, message: res.message || 'Logged in successfully.' };
      }
      return { success: false, message: res.message || 'Login failed.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const register = async (name, email, pass) => {
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password: pass,
      });

      if (res.success && res.data.user) {
        setUser(res.data.user);
        api.setToken(res.data.token);
        return { success: true, message: res.message || 'Account created successfully.' };
      }
      return { success: false, message: res.message || 'Registration failed.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    } finally {
      api.setToken(null);
      setUser(null);
    }
  };

  const updateProfile = async (name) => {
    try {
      const res = await api.patch('/users/profile', { name });
      if (res.success && res.data.user) {
        setUser(res.data.user);
        return { success: true, message: res.message || 'Profile updated successfully.' };
      }
      return { success: false, message: res.message || 'Update failed.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await api.patch('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return { success: res.success, message: res.message || 'Password changed.' };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
