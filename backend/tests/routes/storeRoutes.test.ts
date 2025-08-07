import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import { signJwt } from '../../src/middleware/auth';

describe('Store Routes', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    await db.migrate.latest();
    // Create a user and get token
    const [user] = await db('user').insert({ username: 'storetest', password_hash: 'x' }).returning('*');
    userId = user.id;
    token = 'Bearer ' + signJwt(userId);
  });

  afterAll(async () => {
    await db('supermarket').truncate();
    await db('user').truncate();
    await db.destroy();
  });

  it('should create a store', async () => {
    const res = await request(app)
      .post('/api/stores')
      .set('Authorization', token)
      .send({ name: 'Test Store', location: 'Main St' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Store');
  });

  it('should fail validation for empty name', async () => {
    const res = await request(app)
      .post('/api/stores')
      .set('Authorization', token)
      .send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ERR_VALIDATION');
  });

  it('should list stores and filter by name', async () => {
    await request(app).post('/api/stores').set('Authorization', token).send({ name: 'Alpha' });
    await request(app).post('/api/stores').set('Authorization', token).send({ name: 'Beta' });
    let res = await request(app).get('/api/stores').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    res = await request(app).get('/api/stores?name=Alpha').set('Authorization', token);
    expect(res.body.some((s: any) => s.name === 'Alpha')).toBe(true);
  });

  it('should get a store by id', async () => {
    const create = await request(app).post('/api/stores').set('Authorization', token).send({ name: 'Gamma' });
    const id = create.body.id;
    const res = await request(app).get(`/api/stores/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Gamma');
  });

  it('should return 404 for missing store', async () => {
    const res = await request(app).get('/api/stores/99999').set('Authorization', token);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('ERR_STORE_NOT_FOUND');
  });

  it('should update a store', async () => {
    const create = await request(app).post('/api/stores').set('Authorization', token).send({ name: 'Delta' });
    const id = create.body.id;
    const res = await request(app).put(`/api/stores/${id}`).set('Authorization', token).send({ location: 'New Place' });
    expect(res.status).toBe(200);
    expect(res.body.location).toBe('New Place');
  });

  it('should delete a store', async () => {
    const create = await request(app).post('/api/stores').set('Authorization', token).send({ name: 'Epsilon' });
    const id = create.body.id;
    const res = await request(app).delete(`/api/stores/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
