
import { User } from '../../types/entities';
import { getDB } from '../index';
import * as bcrypt from 'bcryptjs';

const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'grocodex_current_user_id';

/**
 * Updates the current user's theme preference.
 *
 * @param theme - The new theme ('light' or 'dark').
 * @returns A promise that resolves to the updated User object.
 * @throws { error: 'ERR_NOT_LOGGED_IN' } If there is no currently logged-in user.
 */
export async function updateTheme(theme: 'light' | 'dark'): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw { error: 'ERR_NOT_LOGGED_IN' };
  user.theme = theme;
  user.updated_at = new Date().toISOString();
  const db = await getDB();
  await db.put(USERS_KEY, user);
  return user;
}

/**
 * Ensures a default admin user exists in the database.
 * Call this during DB setup/initialization.
 * Default credentials: username 'admin', password 'admin'.
 */
export async function ensureDefaultAdminUser() {
  const users = await getAllUsers();
  if (!users || users.length === 0) {
    const password_hash = await bcrypt.hash('admin', 10);
    const user: User = {
      id: crypto.randomUUID(),
      username: 'admin',
      password_hash,
      created_at: new Date().toISOString(),
      isAdmin: true,
    };
    const db = await getDB();
    await db.put(USERS_KEY, user);
  }
}


/**
 * Retrieves all users from the database.
 *
 * @returns {Promise<User[]>} A promise that resolves to an array of all users.
 */
export async function getAllUsers(): Promise<User[]> {
  const db = await getDB();
  return db.getAll(USERS_KEY) as Promise<User[]>;
}

/**
 * Deletes a user by ID (admin only).
 * @param id - The user ID to delete.
 * @returns Promise<void>
 */
export async function deleteUser(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(USERS_KEY, id);
}

/**
 * Registers a new user with the provided username and password.
 *
 * @param username - The desired username for the new user.
 * @param password - The password for the new user.
 * @returns A promise that resolves to the created {@link User} object.
 * @throws { error: 'ERR_REQUIRED_FIELDS' } If either the username or password is missing.
 * @throws { error: 'ERR_USERNAME_EXISTS' } If the username is already taken.
 *
 * @remarks
 * - Hashes the password before storing.
 * - Stores the new user in the database and sets the current user in localStorage.
 */
export async function registerUser(username: string, password: string): Promise<User> {
  if (!username || !password) throw { error: 'ERR_REQUIRED_FIELDS' };
  const users = await getAllUsers();
  if (users.some(u => u.username === username)) throw { error: 'ERR_USERNAME_EXISTS' };
  const password_hash = await bcrypt.hash(password, 10);
  const user: User = {
    id: crypto.randomUUID(),
    username,
    password_hash,
    created_at: new Date().toISOString(),
  };
  const db = await getDB();
  await db.put(USERS_KEY, user);
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
}

/**
 * Attempts to log in a user with the provided username and password.
 *
 * Retrieves all users, finds the user matching the given username, and verifies the password
 * using bcrypt. If authentication is successful, stores the user's ID in localStorage and returns
 * the user object. Throws an error with `{ error: 'ERR_INVALID_CREDENTIALS' }` if the username
 * does not exist or the password is incorrect.
 *
 * @param username - The username of the user attempting to log in.
 * @param password - The plaintext password to authenticate.
 * @returns A promise that resolves to the authenticated `User` object.
 * @throws An error object with `{ error: 'ERR_INVALID_CREDENTIALS' }` if authentication fails.
 */
export async function loginUser(username: string, password: string): Promise<User> {
  const users = await getAllUsers();
  const user = users.find(u => u.username === username);
  if (!user) throw { error: 'ERR_INVALID_CREDENTIALS' };
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw { error: 'ERR_INVALID_CREDENTIALS' };
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
}

/**
 * Logs out the current user by removing their information from local storage.
 *
 * This function deletes the item associated with the `CURRENT_USER_KEY` from the browser's local storage,
 * effectively logging out the user on the client side.
 */
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Retrieves the currently logged-in user based on the user ID stored in localStorage.
 *
 * @returns A promise that resolves to the current {@link User} object if found, or `undefined` if no user is logged in or the user cannot be found.
 */
export async function getCurrentUser(): Promise<User | undefined> {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return undefined;
  const users = await getAllUsers();
  return users.find(u => u.id === id);
}


/**
 * Updates the current user's profile with a new username and/or avatar.
 *
 * @param newUsername - The new username to assign to the current user.
 * @param avatar - Optional avatar image (base64 string or blob URL).
 * @returns A promise that resolves to the updated User object.
 * @throws { error: 'ERR_REQUIRED_FIELDS' } If the new username is not provided.
 * @throws { error: 'ERR_NOT_LOGGED_IN' } If there is no currently logged-in user.
 * @throws { error: 'ERR_USERNAME_EXISTS' } If the new username is already taken by another user.
 */
export async function updateProfile(newUsername: string, avatar?: string): Promise<User> {
  if (!newUsername) throw { error: 'ERR_REQUIRED_FIELDS' };
  const user = await getCurrentUser();
  if (!user) throw { error: 'ERR_NOT_LOGGED_IN' };
  const users = await getAllUsers();
  if (users.some(u => u.username === newUsername && u.id !== user.id)) throw { error: 'ERR_USERNAME_EXISTS' };
  user.username = newUsername;
  if (avatar !== undefined) {
    user.avatar = avatar;
  }
  user.updated_at = new Date().toISOString();
  const db = await getDB();
  await db.put(USERS_KEY, user);
  return user;
}

/**
 * Changes the current user's password after verifying the old password.
 *
 * @param oldPassword - The user's current password for verification.
 * @param newPassword - The new password to set for the user.
 * @returns A promise that resolves when the password has been successfully changed.
 * @throws { error: 'ERR_NOT_LOGGED_IN' } If the user is not logged in.
 * @throws { error: 'ERR_INVALID_CREDENTIALS' } If the old password is incorrect.
 */
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw { error: 'ERR_NOT_LOGGED_IN' };
  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw { error: 'ERR_INVALID_CREDENTIALS' };
  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.updated_at = new Date().toISOString();
  const db = await getDB();
  await db.put(USERS_KEY, user);
}

/**
 * Deletes the currently logged-in user's account from the database.
 *
 * This function retrieves the current user, and if a user is logged in,
 * deletes their record from the USERS_KEY store in the database.
 * After deletion, it logs the user out.
 *
 * @throws {Object} Throws an error with `{ error: 'ERR_NOT_LOGGED_IN' }` if no user is logged in.
 * @returns {Promise<void>} Resolves when the account has been deleted and the user has been logged out.
 */
export async function deleteAccount(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw { error: 'ERR_NOT_LOGGED_IN' };
  const db = await getDB();
  await db.delete(USERS_KEY, user.id);
  logoutUser();
}

/**
 * Admin-only: Adds a user without changing the current logged-in user.
 *
 * @param username - The desired username for the new user.
 * @param password - The password for the new user.
 * @returns A promise that resolves to the created {@link User} object.
 * @throws { error: 'ERR_REQUIRED_FIELDS' } If either the username or password is missing.
 * @throws { error: 'ERR_USERNAME_EXISTS' } If the username is already taken.
 */
export async function adminAddUser(username: string, password: string): Promise<User> {
  if (!username || !password) throw { error: 'ERR_REQUIRED_FIELDS' };
  const users = await getAllUsers();
  if (users.some(u => u.username === username)) throw { error: 'ERR_USERNAME_EXISTS' };
  const password_hash = await bcrypt.hash(password, 10);
  const user: User = {
    id: crypto.randomUUID(),
    username,
    password_hash,
    created_at: new Date().toISOString(),
  };
  const db = await getDB();
  await db.put(USERS_KEY, user);
  // Do NOT set CURRENT_USER_KEY here
  return user;
}