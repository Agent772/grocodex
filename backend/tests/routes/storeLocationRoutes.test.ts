
import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import fs from 'fs';
import path from 'path';
describe('Store Location Routes', () => {
  let token: string;
  let storeId: number;
  let productId: number;
  beforeAll(async () => {
    // Read the global test token from file
    const tokenPath = path.join('/tmp', 'grocodex_test_token.json');
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    token = `Bearer ${tokenData.token}`;
    // Create store and product for tests (using global test user)
    const userId = tokenData.userId;
    const storeInsert = await db('supermarket').insert({ name: 'LocStore', created_by_user_id: userId }).returning('id');
    storeId = Array.isArray(storeInsert) ? (storeInsert[0]?.id ?? storeInsert[0]) : storeInsert;
    const prodInsert = await db('product').insert({ name: 'LocProduct', created_by_user_id: userId }).returning('id');
    productId = Array.isArray(prodInsert) ? (prodInsert[0]?.id ?? prodInsert[0]) : prodInsert;
  });

  it('should create a store location', async () => {
    const res = await request(app)
      .post('/api/store-locations')
      .set('Authorization', token)
      .send({ product_id: productId, supermarket_id: storeId, location: 'Aisle 1' });
    expect(res.status).toBe(201);
    expect(res.body.location).toBe('Aisle 1');
  });

  it('should fail validation for missing product_id', async () => {
    const res = await request(app)
      .post('/api/store-locations')
      .set('Authorization', token)
      .send({ supermarket_id: storeId });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ERR_VALIDATION');
  });

  it('should list store locations and filter by supermarket_id', async () => {
    await request(app).post('/api/store-locations').set('Authorization', token).send({ product_id: productId, supermarket_id: storeId, location: 'Aisle 2' });
    let res = await request(app).get('/api/store-locations').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    res = await request(app).get(`/api/store-locations?supermarket_id=${storeId}`).set('Authorization', token);
    expect(res.body.some((l: any) => l.supermarket_id === storeId)).toBe(true);
  });

  it('should get a store location by id', async () => {
    const create = await request(app).post('/api/store-locations').set('Authorization', token).send({ product_id: productId, supermarket_id: storeId, location: 'Aisle 3' });
    const id = create.body.id;
    const res = await request(app).get(`/api/store-locations/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.location).toBe('Aisle 3');
  });

  it('should update a store location', async () => {
    const create = await request(app).post('/api/store-locations').set('Authorization', token).send({ product_id: productId, supermarket_id: storeId, location: 'Aisle 4' });
    const id = create.body.id;
    const res = await request(app).put(`/api/store-locations/${id}`).set('Authorization', token).send({ location: 'Aisle 5' });
    expect(res.status).toBe(200);
    expect(res.body.location).toBe('Aisle 5');
  });

  it('should delete a store location', async () => {
    const create = await request(app).post('/api/store-locations').set('Authorization', token).send({ product_id: productId, supermarket_id: storeId, location: 'Aisle 6' });
    const id = create.body.id;
    const res = await request(app).delete(`/api/store-locations/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
