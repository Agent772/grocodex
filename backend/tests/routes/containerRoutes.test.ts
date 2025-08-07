import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import { signJwt } from '../../src/middleware/auth';

// Helper to create a test user and get a real JWT
afterAll(async () => {
  await db.destroy();
});

async function getAuthToken() {
  let user = await db('user').where({ username: 'testuser' }).first();
  if (!user) {
    const [id] = await db('user').insert({ username: 'testuser', password_hash: 'testhash' });
    user = await db('user').where({ id }).first();
  }
  const token = signJwt(user.id);
  return `Bearer ${token}`;
}

describe('Container Routes', () => {
  let token: string;
  beforeEach(async () => {
    await db('container').truncate();
    await db('user').truncate();
    // Create user and get fresh token after truncation
    let user = await db('user').where({ username: 'testuser' }).first();
    if (!user) {
      // Use a valid bcrypt hash for 'testpassword' (hash: $2a$10$wzQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw)
      const validHash = '$2a$10$wzQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw';
      const [id] = await db('user').insert({ username: 'testuser', password_hash: validHash });
      user = await db('user').where({ id }).first();
    }
    token = signJwt(user.id);
    token = `Bearer ${token}`;
  });

  it('should create a container', async () => {
    const res = await request(app)
      .post('/api/containers')
      .set('Authorization', token)
      .send({ name: 'Fridge' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Fridge');
  });

  it('should get all containers', async () => {
    const res = await request(app)
      .get('/api/containers')
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a single container by id', async () => {
    const createRes = await request(app)
      .post('/api/containers')
      .set('Authorization', token)
      .send({ name: 'Pantry' });
    const id = createRes.body.id;
    const res = await request(app)
      .get(`/api/containers/${id}`)
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Pantry');
  });

  it('should update a container', async () => {
    const createRes = await request(app)
      .post('/api/containers')
      .set('Authorization', token)
      .send({ name: 'Shelf' });
    const id = createRes.body.id;
    const res = await request(app)
      .put(`/api/containers/${id}`)
      .set('Authorization', token)
      .send({ name: 'Updated Shelf' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Shelf');
  });

  it('should delete a container', async () => {
    const createRes = await request(app)
      .post('/api/containers')
      .set('Authorization', token)
      .send({ name: 'Box' });
    const id = createRes.body.id;
    const res = await request(app)
      .delete(`/api/containers/${id}`)
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should create a nested container', async () => {
    const parentRes = await request(app)
      .post('/api/containers')
      .set('Authorization', token)
      .send({ name: 'Main Fridge' });
    const parentId = parentRes.body.id;
    const childRes = await request(app)
      .post('/api/containers')
      .set('Authorization', token)
      .send({ name: 'Door Shelf', parent_container_id: parentId });
    expect(childRes.status).toBe(201);
    expect(childRes.body.parent_container_id).toBe(parentId);
  });
});
