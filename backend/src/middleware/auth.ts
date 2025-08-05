import { Request, Response, NextFunction } from 'express';
import db from '../db';
import jwt from 'jsonwebtoken';

// JWT secret should be set via env variable in production
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'ERR_AUTH_REQUIRED' });
  }
  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    // Optionally, check user exists in DB
    db('user').where({ id: payload.userId }).first().then(user => {
      if (!user) {
        return res.status(401).json({ error: 'ERR_INVALID_USER' });
      }
      (req as any).user = user;
      next();
    }).catch(() => res.status(500).json({ error: 'ERR_AUTH_FAILED' }));
  } catch {
    return res.status(401).json({ error: 'ERR_INVALID_TOKEN' });
  }
}

// Helper to sign JWT for a user
export function signJwt(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}
