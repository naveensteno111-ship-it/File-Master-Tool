import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import {
  loginUser,
  registerUser,
  fetchCurrentUser,
  fetchUserUsage,
  updateUserProfile,
  setStoredToken,
  getStoredToken,
  UserUsageResponse,
} from '../services/apiService';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  usage: UserUsageResponse | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshUsage: () => Promise<void>;
  updateProfile: (data: { name?: string; avatarUrl?: string; newPassword?: string }) => Promise<void>;
  isLimitReached: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UserUsageResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const refreshUsage = useCallback(async () => {
    try {
      const data = await fetchUserUsage();
      setUsage(data);
    } catch {
      // ignore in offline/initial
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      refreshUsage();
      return;
    }

    try {
      const currentUser = await fetchCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await refreshUsage();
      }
    } catch (e) {
      console.warn('Session expired or invalid', e);
      setStoredToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshUsage]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await loginUser(email, password);
    setUser(res.user);
    await refreshUsage();
    showToast(`Welcome back, ${res.user.name}!`, 'success');
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await registerUser(name, email, password);
    setUser(res.user);
    await refreshUsage();
    showToast(`Account created! Welcome to FileMaster Tools, ${res.user.name}.`, 'success');
  };

  const logout = () => {
    setStoredToken(null);
    setUser(null);
    refreshUsage();
    showToast('You have been logged out.', 'info');
  };

  const updateProfile = async (data: { name?: string; avatarUrl?: string; newPassword?: string }) => {
    const updated = await updateUserProfile(data);
    setUser(updated);
    showToast('Profile updated successfully.', 'success');
  };

  const isLimitReached = usage ? usage.remainingToday <= 0 : false;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin,
        usage,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        refreshUsage,
        updateProfile,
        isLimitReached,
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
