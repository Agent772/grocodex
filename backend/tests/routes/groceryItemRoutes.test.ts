declare global {
  // eslint-disable-next-line no-var
  var testUserId: number;
}
import request from 'supertest';
import app from '../../src/index';
import db from '../../src/db';
import { signJwt } from '../../src/middleware/auth';

afterAll(async () => {
  await db.destroy();
});

async function getAuthToken() {
  let user = await db('user').where({ username: 'grocerytestuser' }).first();
  if (!user) {
    const [id] = await db('user').insert({ username: 'grocerytestuser', password_hash: 'testhash' });
    user = await db('user').where({ id }).first();
  }
  const token = signJwt(user.id);
  return `Bearer ${token}`;
}

describe('Grocery Item Routes', () => {
  let token: string;
  let containerId: number;
  beforeEach(async () => {
    await db('grocery_item').truncate();
    await db('product').truncate();
    await db('container').truncate();
    await db('user').truncate();
        // Create user and get fresh token after truncation
        let user = await db('user').where({ username: 'grocerytestuser' }).first();
        if (!user) {
            // Use a valid bcrypt hash for 'testpassword' (hash: $2a$10$wzQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw)
            const validHash = '$2a$10$wzQwQwQwQwQwQwQwQwQwQeQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQwQw';
            const [id] = await db('user').insert({ username: 'grocerytestuser', password_hash: validHash });
            user = await db('user').where({ id }).first();
        }
        token = signJwt(user.id);
        token = `Bearer ${token}`;
        global.testUserId = user.id;
        // Create a container for grocery items with required fields
        const containerRes = await db('container').insert({ name: 'Test Container', created_by_user_id: user.id, updated_by_user_id: user.id });
        containerId = Array.isArray(containerRes) ? containerRes[0] : containerRes;
  });

  it('should create a grocery item', async () => {
        // Create a product first with required fields
        const prodRes = await request(app)
          .post('/api/products')
          .set('Authorization', token)
          .send({ name: 'Milk', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
        if (!prodRes.body || !prodRes.body.id) throw new Error('Product creation failed: ' + JSON.stringify(prodRes.body));
        const productId = prodRes.body.id;
        const payload = {
            name: 'Milk Item',
            product_id: productId,
            container_id: containerId,
            unit: 'pcs',
            quantity: 1
        };
    const res = await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send(payload);
    if (res.status !== 201) console.log('Create error:', res.body, 'Payload:', payload);
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Milk Item');
  });

  it('should get all grocery items', async () => {
    const res = await request(app)
      .get('/api/grocery-items')
      .set('Authorization', token);
    if (res.status !== 200) console.log('Get all error:', res.body);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a single grocery item by id', async () => {
        // Create a product and grocery item with required fields
        const prodRes = await request(app)
          .post('/api/products')
          .set('Authorization', token)
          .send({ name: 'Bread', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
        if (!prodRes.body || !prodRes.body.id) throw new Error('Product creation failed: ' + JSON.stringify(prodRes.body));
        const productId = prodRes.body.id;
        const payload = {
            name: 'Bread Item',
            product_id: productId,
            container_id: containerId,
            unit: 'pcs',
            quantity: 1
        };
    const createRes = await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send(payload);
    const id = createRes.body.id;
    const res = await request(app)
      .get(`/api/grocery-items/${id}`)
      .set('Authorization', token);
    if (res.status !== 200) console.log('Get error:', res.body, 'Payload:', payload);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Bread Item');
  });

  it('should update a grocery item', async () => {
        // Create a product and grocery item with required fields
        const prodRes = await request(app)
          .post('/api/products')
          .set('Authorization', token)
          .send({ name: 'Eggs', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
        if (!prodRes.body || !prodRes.body.id) throw new Error('Product creation failed: ' + JSON.stringify(prodRes.body));
        const productId = prodRes.body.id;
        const createPayload = {
            name: 'Eggs Item',
            product_id: productId,
            container_id: containerId,
            unit: 'pcs',
            quantity: 1
        };
    const createRes = await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send(createPayload);
    const id = createRes.body.id;
        const updatePayload = {
            name: 'Updated Eggs Item',
            unit: 'pcs',
            quantity: 2,
            updated_by_user_id: global.testUserId
        };
    const res = await request(app)
      .put(`/api/grocery-items/${id}`)
      .set('Authorization', token)
      .send(updatePayload);
    if (res.status !== 200) console.log('Update error:', res.body, 'Payload:', updatePayload);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated Eggs Item');
  });

  it('should delete a grocery item', async () => {
        // Create a product and grocery item with required fields
        const prodRes = await request(app)
          .post('/api/products')
          .set('Authorization', token)
          .send({ name: 'Juice', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
        if (!prodRes.body || !prodRes.body.id) throw new Error('Product creation failed: ' + JSON.stringify(prodRes.body));
        const productId = prodRes.body.id;
        const payload = {
            name: 'Juice Item',
            product_id: productId,
            container_id: containerId,
            unit: 'pcs',
            quantity: 1
        };
    const createRes = await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send(payload);
    const id = createRes.body.id;
    const res = await request(app)
      .delete(`/api/grocery-items/${id}`)
      .set('Authorization', token);
    if (res.status !== 200) console.log('Delete error:', res.body, 'Payload:', payload);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
