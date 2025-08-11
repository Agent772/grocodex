
import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import fs from 'fs';
import path from 'path';

describe('Product Routes', () => {
  let token: string;
  beforeAll(() => {
    // Read the global test token from file
    const tokenPath = path.join('/tmp', 'grocodex_test_token.json');
    const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
    token = `Bearer ${tokenData.token}`;
  });

  it('should create a product', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Test Product' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Product');
  });

  it('should not delete a product with grocery items', async () => {
    // Ensure user exists and fetch id
    let user = await db('user').where({ username: 'testuser' }).first();
    if (!user) {
      const validHash = '$2a$10$wzQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw';
      const [id] = await db('user').insert({ username: 'testuser', password_hash: validHash });
      user = await db('user').where({ id }).first();
    }
    // Create product
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Product With Items' });
    const productId = prodRes.body.id;
    // Create a container for the grocery item
    const [containerId] = await db('container').insert({ name: 'Test Container', created_by_user_id: user.id, updated_by_user_id: user.id });
    // Create grocery item for this product with all required fields
    await db('grocery_item').insert({ name: 'Item', product_id: productId, container_id: containerId, unit: 'pcs', quantity: 1, created_by_user_id: user.id, updated_by_user_id: user.id });
    // Try to delete product
    const delRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', token);
    expect(delRes.status).toBe(409);
    expect(delRes.body.error).toBe('ERR_PRODUCT_IN_USE');
  });

  it('should cascade delete product and its grocery items', async () => {
    // Ensure user exists and fetch id
    let user = await db('user').where({ username: 'testuser' }).first();
    if (!user) {
      const validHash = '$2a$10$wzQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw';
      const [id] = await db('user').insert({ username: 'testuser', password_hash: validHash });
      user = await db('user').where({ id }).first();
    }
    // Create product
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Cascade Product' });
    const productId = prodRes.body.id;
    // Create a container for the grocery item
    const [containerId] = await db('container').insert({ name: 'Cascade Container', created_by_user_id: user.id, updated_by_user_id: user.id });
    // Create grocery item for this product with all required fields
    await db('grocery_item').insert({ name: 'Cascade Item', product_id: productId, container_id: containerId, unit: 'pcs', quantity: 1, created_by_user_id: user.id, updated_by_user_id: user.id });
    // Cascade delete
    const delRes = await request(app)
      .delete(`/api/products/${productId}/cascade`)
      .set('Authorization', token);
    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);
    // Product and grocery item should be gone
    const prod = await db('product').where({ id: productId }).first();
    expect(prod).toBeUndefined();
    const item = await db('grocery_item').where({ product_id: productId }).first();
    expect(item).toBeUndefined();
  });
  it('should list products with and without filters', async () => {
    // Create products
    await request(app).post('/api/products').set('Authorization', token).send({ name: 'Apple' });
    await request(app).post('/api/products').set('Authorization', token).send({ name: 'Banana' });
    // List all
    let res = await request(app).get('/api/products').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    // Filter by name
    res = await request(app).get('/api/products?name=Apple').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.some((p: any) => p.name === 'Apple')).toBe(true);
    // Pagination
    res = await request(app).get('/api/products?limit=1').set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it('should fetch a single product by id', async () => {
    const createRes = await request(app).post('/api/products').set('Authorization', token).send({ name: 'Single Product' });
    const id = createRes.body.id;
    let res = await request(app).get(`/api/products/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Single Product');
    // Not found
    res = await request(app).get('/api/products/99999').set('Authorization', token);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('ERR_PRODUCT_NOT_FOUND');
    // Invalid ID
    res = await request(app).get('/api/products/abc').set('Authorization', token);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ERR_INVALID_ID');
  });

  it('should update a product', async () => {
    const createRes = await request(app).post('/api/products').set('Authorization', token).send({ name: 'ToUpdate' });
    const id = createRes.body.id;
    let res = await request(app).put(`/api/products/${id}`).set('Authorization', token).send({ name: 'Updated Product' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Product');
    // Validation error
    res = await request(app).put(`/api/products/${id}`).set('Authorization', token).send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ERR_VALIDATION');
    // Not found
    res = await request(app).put('/api/products/99999').set('Authorization', token).send({ name: 'Nope' });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('ERR_PRODUCT_NOT_FOUND');
  });

  it('should delete a product (if not in use)', async () => {
    const createRes = await request(app).post('/api/products').set('Authorization', token).send({ name: 'ToDelete' });
    const id = createRes.body.id;
    let res = await request(app).delete(`/api/products/${id}`).set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    // Not found
    res = await request(app).delete('/api/products/99999').set('Authorization', token);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('ERR_PRODUCT_NOT_FOUND');
    // Invalid ID
    res = await request(app).delete('/api/products/abc').set('Authorization', token);
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ERR_INVALID_ID');
  });

  it('should return validation error for invalid product creation', async () => {
    const res = await request(app).post('/api/products').set('Authorization', token).send({ name: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('ERR_VALIDATION');
  });
});
