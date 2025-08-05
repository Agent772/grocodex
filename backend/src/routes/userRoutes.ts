import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByUsername, findUserById, createUser } from '../models/user';
import { requireAuth } from '../middleware/auth';

const router = Router();


// Edit profile (change username)
router.put('/profile', requireAuth, async (req, res) => {
  const { username } = req.body;
  const user = (req as any).user;
  if (!username) {
    return res.status(400).json({ error: 'ERR_REQUIRED_FIELDS' });
  }
  try {
    // Check if username is taken by another user
    const existing = await findUserByUsername(username);
    if (existing && existing.id !== user.id) {
      return res.status(409).json({ error: 'ERR_USERNAME_EXISTS' });
    }
    await require('../db').default('user').where({ id: user.id }).update({ username });
    res.json({ id: user.id, username });
  } catch (err) {
    res.status(500).json({ error: 'ERR_PROFILE_UPDATE_FAILED' });
  }
});

// Change password
router.put('/change-password', requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = (req as any).user;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'ERR_REQUIRED_FIELDS' });
  }
  try {
    const valid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'ERR_INVALID_CREDENTIALS' });
    }
    const password_hash = await bcrypt.hash(newPassword, 10);
    await require('../db').default('user').where({ id: user.id }).update({ password_hash });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_PASSWORD_CHANGE_FAILED' });
  }
});

// Delete account
router.delete('/account', requireAuth, async (req, res) => {
  const user = (req as any).user;
  try {
    await require('../db').default('user').where({ id: user.id }).del();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_ACCOUNT_DELETE_FAILED' });
  }
});

// User registration
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'ERR_REQUIRED_FIELDS' });
  }
  try {
    const existing = await findUserByUsername(username);
    if (existing) {
      return res.status(409).json({ error: 'ERR_USERNAME_EXISTS' });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const user = await createUser(username, password_hash);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'ERR_REGISTRATION_FAILED' });
  }
});

// User login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'ERR_REQUIRED_FIELDS' });
  }
  try {
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'ERR_INVALID_CREDENTIALS' });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'ERR_INVALID_CREDENTIALS' });
    }
    // Issue JWT
    const { signJwt } = await import('../middleware/auth');
    const token = signJwt(user.id);
    res.json({ id: user.id, username: user.username, token });
  } catch (err) {
    res.status(500).json({ error: 'ERR_LOGIN_FAILED' });
  }
});

// List all users
// Example protected route: list all users (requires auth)
router.get('/users', requireAuth, async (_req, res) => {
  try {
    // Only allow if authenticated (requireAuth middleware)
    const users = await require('../db').default('user').select('id', 'username', 'created_at');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'ERR_FETCH_USERS_FAILED' });
  }
});

export default router;
