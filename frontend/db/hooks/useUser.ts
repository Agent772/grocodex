import { useCallback, useState } from 'react';
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


/**
 * React hook for managing user authentication and profile operations.
 *
 * Provides state and methods for:
 * - Loading the current user from persistent storage
 * - Registering a new user
 * - Logging in and out
 * - Updating user profile information
 * - Changing the user's password
 * - Deleting the user's account
 *
 * @returns An object containing:
 * - `user`: The current user object or `undefined` if not logged in
 * - `loading`: Boolean indicating if an operation is in progress
 * - `error`: Error message string or `null` if no error
 * - `loadCurrentUser`: Loads the current user from storage
 * - `register`: Registers a new user
 * - `login`: Logs in a user
 * - `logout`: Logs out the current user
 * - `update`: Updates the current user's profile
 * - `changePassword`: Changes the current user's password
 * - `deleteAccount`: Deletes the current user's account
 */
export function useUser() {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Loads the current user from IndexedDB/localStorage.
   */
  const loadCurrentUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const u = await getCurrentUser();
      setUser(u);
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_FETCH_FAILED');
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registers a new user and sets as current user.
   */
  const register = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await registerUser(username, password);
      setUser(u);
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_REGISTER_FAILED');
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logs in a user and sets as current user.
   */
  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await loginUser(username, password);
      setUser(u);
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_LOGIN_FAILED');
      setUser(undefined);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logs out the current user.
   */
  const logout = useCallback(() => {
    logoutUser();
    setUser(undefined);
  }, []);

  /**
   * Updates the current user's profile (username).
   */
  const update = useCallback(async (newUsername: string) => {
    setLoading(true);
    setError(null);
    try {
      const u = await updateProfile(newUsername);
      setUser(u);
    } catch (e: any) {
      setError(e?.error || 'ERR_USER_UPDATE_FAILED');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Changes the current user's password.
   */
  const changePwd = useCallback(async (oldPassword: string, newPassword: string) => {
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

  /**
   * Deletes the current user's account.
   */
  const remove = useCallback(async () => {
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

  return {
    user,
    loading,
    error,
    loadCurrentUser,
    register,
    login,
    logout,
    update,
    changePassword: changePwd,
    deleteAccount: remove,
  };
}
