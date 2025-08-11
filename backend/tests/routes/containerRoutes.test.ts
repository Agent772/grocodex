
import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import fs from 'fs';
import path from 'path';

let token: string;
beforeAll(() => {
  // Read the global test token from file
  const tokenPath = path.join('/tmp', 'grocodex_test_token.json');
  const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  token = `Bearer ${tokenData.token}`;
});

describe('Container Routes', () => {

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
