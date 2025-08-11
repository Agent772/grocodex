// Local user management for Grocodex frontend (IndexedDB + localStorage)
// - Register, login, logout, get current user
// - Passwords are hashed locally (bcryptjs)
// - No user switching UI, just login/logout
// - All users share the same household data

import { User } from '../../types/entities';
import bcrypt from 'bcryptjs';

const USERS_KEY = 'users'; // IndexedDB store name
const CURRENT_USER_KEY = 'grocodex_current_user_id'; // localStorage key

// Helper: get all users from IndexedDB
async function getAllUsers(): Promise<User[]> {
  const db = await import('../index').then(m => m.getDB());
  return db.getAll(USERS_KEY) as Promise<User[]>;
}

// Register a new user (local only)
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
  const db = await import('../index').then(m => m.getDB());
  await db.put(USERS_KEY, user);
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
}

// Login (local only)
export async function loginUser(username: string, password: string): Promise<User> {
  const users = await getAllUsers();
  const user = users.find(u => u.username === username);
  if (!user) throw { error: 'ERR_INVALID_CREDENTIALS' };
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw { error: 'ERR_INVALID_CREDENTIALS' };
  localStorage.setItem(CURRENT_USER_KEY, user.id);
  return user;
}

// Logout
export function logoutUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

// Get current user (from localStorage)
export async function getCurrentUser(): Promise<User | undefined> {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return undefined;
  const users = await getAllUsers();
  return users.find(u => u.id === id);
}

// Edit profile (change username)
export async function updateProfile(newUsername: string): Promise<User> {
  if (!newUsername) throw { error: 'ERR_REQUIRED_FIELDS' };
  const user = await getCurrentUser();
  if (!user) throw { error: 'ERR_NOT_LOGGED_IN' };
  const users = await getAllUsers();
  if (users.some(u => u.username === newUsername && u.id !== user.id)) throw { error: 'ERR_USERNAME_EXISTS' };
  user.username = newUsername;
  user.updated_at = new Date().toISOString();
  const db = await import('../index').then(m => m.getDB());
  await db.put(USERS_KEY, user);
  return user;
}

// Change password
export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw { error: 'ERR_NOT_LOGGED_IN' };
  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw { error: 'ERR_INVALID_CREDENTIALS' };
  user.password_hash = await bcrypt.hash(newPassword, 10);
  user.updated_at = new Date().toISOString();
  const db = await import('../index').then(m => m.getDB());
  await db.put(USERS_KEY, user);
}

// Delete account
export async function deleteAccount(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) throw { error: 'ERR_NOT_LOGGED_IN' };
  const db = await import('../index').then(m => m.getDB());
  await db.delete(USERS_KEY, user.id);
  logoutUser();
}
