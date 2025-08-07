import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';

describe('User Routes', () => {
  let token: string;
  let userId: number;
  beforeEach(async () => {
    await db('user').truncate();
    // Register and login a user for authenticated routes
    const res = await request(app)
      .post('/api/register')
      .send({ username: 'edituser', password: 'testpass' });
    userId = res.body.id;
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'edituser', password: 'testpass' });
    token = `Bearer ${loginRes.body.token}`;
  });
  // ...existing code...
  afterAll(async () => {
    await db.destroy();
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
    const res = await request(app)
      .put('/api/profile')
      .set('Authorization', token)
      .send({ username: 'editeduser' });
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('editeduser');
    // Should not allow duplicate username
    await db('user').insert({ username: 'taken', password_hash: 'hash' });
    const dupeRes = await request(app)
      .put('/api/profile')
      .set('Authorization', token)
      .send({ username: 'taken' });
    expect(dupeRes.status).toBe(409);
    expect(dupeRes.body.error).toBe('ERR_USERNAME_EXISTS');
  });

  it('should change password', async () => {
    // Wrong old password
    let res = await request(app)
      .put('/api/change-password')
      .set('Authorization', token)
      .send({ oldPassword: 'wrong', newPassword: 'newpass' });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe('ERR_INVALID_CREDENTIALS');
    // Correct old password
    res = await request(app)
      .put('/api/change-password')
      .set('Authorization', token)
      .send({ oldPassword: 'testpass', newPassword: 'newpass' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Login with new password
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'edituser', password: 'newpass' });
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
    expect(res.body.some((u: any) => u.username === 'edituser')).toBe(true);
  });

  it('should delete account', async () => {
    const res = await request(app)
      .delete('/api/account')
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Should not be able to login after deletion
    const loginRes = await request(app)
      .post('/api/login')
      .send({ username: 'edituser', password: 'testpass' });
    expect(loginRes.status).toBe(401);
  });

});
