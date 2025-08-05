import request from 'supertest';

import app from '../../src/index';
import db from '../../src/db';
import { signJwt } from '../../src/middleware/auth';

// Helper to create a test user and get a real JWT
async function getAuthToken() {
  // Create a test user if not exists
  let user = await db('user').where({ username: 'testuser' }).first();
  if (!user) {
    const [id] = await db('user').insert({ username: 'testuser', password_hash: 'testhash' });
    user = await db('user').where({ id }).first();
  }
  const token = signJwt(user.id);
  return `Bearer ${token}`;
}

describe('Product Routes', () => {
  let token: string;
  beforeAll(async () => {
    token = await getAuthToken();
  });

  afterAll(async () => {
    // Clean up test DB if needed
    await db.destroy();
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
    // Create product
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Product With Items' });
    const productId = prodRes.body.id;
    // Create grocery item for this product
    await db('grocery_item').insert({ name: 'Item', product_id: productId });
    // Try to delete product
    const delRes = await request(app)
      .delete(`/api/products/${productId}`)
      .set('Authorization', token);
    expect(delRes.status).toBe(409);
    expect(delRes.body.error).toBe('ERR_PRODUCT_IN_USE');
  });

  it('should cascade delete product and its grocery items', async () => {
    // Create product
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Cascade Product' });
    const productId = prodRes.body.id;
    // Create grocery item for this product
    await db('grocery_item').insert({ name: 'Cascade Item', product_id: productId });
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

  // Add more tests for validation, filtering, pagination, etc.
});
