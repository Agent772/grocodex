
import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import fs from 'fs';
import path from 'path';

describe('Category Routes', () => {
  let token: string;
  beforeAll(() => {
    // Read the global test token from file
    const tokenPath = path.join('/tmp', 'grocodex_test_token.json');
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    token = `Bearer ${tokenData.token}`;
  });

  it('should create a category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', token)
      .send({ name: 'Fruit', description: 'All fruits' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Fruit');
  });

  it('should fail validation for empty name', async () => {
    const res = await request(app)
      .post('/api/categories')
      .set('Authorization', token)
      .send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ERR_VALIDATION');
  });

  it('should list categories and filter by name', async () => {
    await request(app).post('/api/categories').set('Authorization', token).send({ name: 'Vegetable' });
    await request(app).post('/api/categories').set('Authorization', token).send({ name: 'Dairy' });
    let res = await request(app).get('/api/categories').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    res = await request(app).get('/api/categories?name=Vegetable').set('Authorization', token);
    expect(res.body.some((c: any) => c.name === 'Vegetable')).toBe(true);
  });

  it('should get a category by id', async () => {
    const create = await request(app).post('/api/categories').set('Authorization', token).send({ name: 'Bakery' });
    const id = create.body.id;
    const res = await request(app).get(`/api/categories/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bakery');
  });

  it('should return 404 for missing category', async () => {
    const res = await request(app).get('/api/categories/99999').set('Authorization', token);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('ERR_CATEGORY_NOT_FOUND');
  });

  it('should update a category', async () => {
    const create = await request(app).post('/api/categories').set('Authorization', token).send({ name: 'Frozen' });
    const id = create.body.id;
    const res = await request(app).put(`/api/categories/${id}`).set('Authorization', token).send({ description: 'Frozen foods' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Frozen foods');
  });

  it('should delete a category', async () => {
    const create = await request(app).post('/api/categories').set('Authorization', token).send({ name: 'Snacks' });
    const id = create.body.id;
    const res = await request(app).delete(`/api/categories/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
