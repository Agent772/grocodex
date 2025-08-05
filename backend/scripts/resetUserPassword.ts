#!/usr/bin/env ts-node
import readline from 'readline';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const db = require('../db').default;

async function listUsers() {
  const users = await db('user').select('id', 'username');
  if (users.length === 0) {
    console.log('No users found.');
    return [];
  }
  console.log('Users:');
  users.forEach(u => console.log(`- ${u.username}`));
  return users;
}

async function resetPassword(username: string, newPassword: string) {
  const user = await db('user').where({ username }).first();
  if (!user) {
    console.error('User not found.');
    process.exit(1);
  }
  const password_hash = await bcrypt.hash(newPassword, 10);
  await db('user').where({ id: user.id }).update({ password_hash });
  console.log(`Password for user '${username}' has been reset.`);
}

async function main() {
  await listUsers();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Enter username to reset password: ', async (username) => {
    if (!username) {
      console.error('No username entered.');
      rl.close();
      process.exit(1);
    }
    rl.question('Enter new password: ', async (newPassword) => {
      if (!newPassword) {
        console.error('No password entered.');
        rl.close();
        process.exit(1);
      }
      await resetPassword(username, newPassword);
      rl.close();
      process.exit(0);
    });
  });
}

main();
