import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import fs from 'fs';
import path from 'path';

describe('User Routes', () => {
  let token: string;
  beforeAll(async () => {
    // Read the global test token from file
    const tokenPath = path.join('/tmp', 'grocodex_test_token.json');
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    token = `Bearer ${tokenData.token}`;
    // Ensure the global test user exists in the DB with the correct username
    const exists = await db('user').where({ username: 'testuser' }).first();
    if (!exists) {
      // Use the same password hash as setupTestDb.js (bcrypt hash for 'testpass')
      const hash = '$2a$10$wH8QwQnQwQnQwQnQwQnQwOQwQnQwQnQwQnQwQnQwQnQwQnQwQnQ';
      await db('user').insert({ username: 'testuser', password_hash: hash });
    }
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'newuser', password: 'testpass' });
    expect(res.status).toBe(201);
    expect(res.body.username).toBe('newuser');
  });

  it('should not register duplicate user', async () => {
    await request(app)
      .post('/api/register')
      .send({ username: 'dupeuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'dupeuser', password: 'testpass' });
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('ERR_USERNAME_EXISTS');
  });

  it('should login with correct credentials', async () => {
    await request(app)
      .post('/api/register')
      .send({ username: 'loginuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'loginuser', password: 'testpass' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('should not login with wrong password', async () => {
    await request(app)
      .post('/api/register')
      .send({ username: 'wrongpassuser', password: 'testpass' });
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'wrongpassuser', password: 'badpass' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('ERR_INVALID_CREDENTIALS');
  });

  it('should edit profile (change username)', async () => {
    // Create a dedicated user for this test
    const username = 'edituser';
    const password = 'testpass';
    await request(app)
      .post('/api/register')
      .send({ username, password });
    // Login to get token
    let loginRes = await request(app)
      .post('/api/login')
      .send({ username, password });
    expect(loginRes.status).toBe(200);
    const userToken = `Bearer ${loginRes.body.token}`;
    // Change username
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', userToken)
      .send({ username: 'editeduser' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('editeduser');
    // Should not allow duplicate username
    await db('user').insert({ username: 'taken', password_hash: 'hash' });
    const dupeRes = await request(app)
      .put('/api/profile')
      .set('Authorization', userToken)
      .send({ username: 'taken' });
    expect(dupeRes.status).toBe(409);
    expect(dupeRes.body.error).toBe('ERR_USERNAME_EXISTS');
  });

  it('should change password', async () => {
    // Create a dedicated user for this test
    const username = 'changepassuser';
    const password = 'testpass';
    await request(app)
      .post('/api/register')
      .send({ username, password });
    // Login to get token
    let loginRes = await request(app)
      .post('/api/login')
      .send({ username, password });
    expect(loginRes.status).toBe(200);
    const userToken = `Bearer ${loginRes.body.token}`;
    // Wrong old password
    let res = await request(app)
      .put('/api/change-password')
      .set('Authorization', userToken)
      .send({ oldPassword: 'wrong', newPassword: 'newpass' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('ERR_INVALID_CREDENTIALS');
    // Correct old password
    res = await request(app)
      .put('/api/change-password')
      .set('Authorization', userToken)
      .send({ oldPassword: password, newPassword: 'newpass' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Login with new password
    loginRes = await request(app)
      .post('/api/login')
      .send({ username, password: 'newpass' });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
  });

  it('should list users (protected)', async () => {
    // Should require auth
    let res = await request(app).get('/api/users');
    expect(res.status).toBe(401);
    // Should return users with auth
    res = await request(app)
      .get('/api/users')
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((u: any) => u.username === 'testuser')).toBe(true);
  });

  it('should delete account', async () => {
    // Create a dedicated user for this test
    const username = 'deleteuser';
    const password = 'testpass';
    await request(app)
      .post('/api/register')
      .send({ username, password });
    // Login to get token
    let loginRes = await request(app)
      .post('/api/login')
      .send({ username, password });
    expect(loginRes.status).toBe(200);
    const userToken = `Bearer ${loginRes.body.token}`;
    // Delete account
    const res = await request(app)
      .delete('/api/account')
      .set('Authorization', userToken);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should not be able to login after deletion
    loginRes = await request(app)
      .post('/api/login')
      .send({ username, password });
    expect(loginRes.status).toBe(401);
  });

});
