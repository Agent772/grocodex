import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  updateProfile,
  changePassword,
  deleteAccount,
} from '../entities/user';
import { User } from '../../types/entities';

interface UserContextType {
  user: User | undefined;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  loading: boolean;
  error: string | null;
  loadCurrentUser: () => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  update: (newUsername: string, avatar?: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await getCurrentUser();
      setUser(u);
      if (u?.theme === 'light' || u?.theme === 'dark') {
        setTheme(u.theme);
      } else {
        setTheme('dark');
      }
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_FETCH_FAILED');
      setUser(undefined);
      setTheme('dark');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCurrentUser();
  }, [loadCurrentUser]);

  const register = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await registerUser(username, password);
      setUser(u);
      setTheme(u.theme === 'light' ? 'light' : 'dark');
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_REGISTER_FAILED');
      setUser(undefined);
      setTheme('dark');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await loginUser(username, password);
      setUser(u);
      setTheme(u.theme === 'light' ? 'light' : 'dark');
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_LOGIN_FAILED');
      setUser(undefined);
      setTheme('dark');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    logoutUser();
    setUser(undefined);
    setTheme('dark');
  }, []);

  const update = useCallback(async (newUsername: string, avatar?: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await updateProfile(newUsername, avatar);
      setUser(u);
      if (u.theme === 'light' || u.theme === 'dark') {
        setTheme(u.theme);
      }
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_UPDATE_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      await changePassword(oldPassword, newPassword);
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_PASSWORD_CHANGE_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteAccountFn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await deleteAccount();
      setUser(undefined);
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_DELETE_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      theme,
      setTheme,
      loading,
      error,
      loadCurrentUser,
      register,
      login,
      logout,
      update,
      changePassword,
      deleteAccount: deleteAccountFn,
    }}>
      {children}
    </UserContext.Provider>
  );
};

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
