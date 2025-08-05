// User model helpers for username+password and OIDC (future)
import db from '../db';

export async function findUserByUsername(username: string) {
  return db('user').where({ username }).first();
}

export async function findUserById(id: number) {
  return db('user').where({ id }).first();
}

export async function createUser(username: string, password_hash: string) {
  const [id] = await db('user').insert({ username, password_hash });
  return { id, username };
}
