declare global {
  // eslint-disable-next-line no-var
  var testUserId: number;
}

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


describe('Grocery Item Routes', () => {
  it('should list only expired grocery items', async () => {
    // Create a product and an expired grocery item
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Old Cheese', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
    const productId = prodRes.body.id;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send({ name: 'Expired Cheese', product_id: productId, container_id: containerId, expiration_date: yesterday });
    const res = await request(app)
      .get('/api/grocery-items?expired=true')
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.some((item: any) => item.name === 'Expired Cheese')).toBe(true);
  });

  it('should list only expiring soon grocery items', async () => {
    // Create a product and a soon-to-expire grocery item
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Yogurt Soon', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
    const productId = prodRes.body.id;
    const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10);
    await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send({ name: 'Soon Yogurt', product_id: productId, container_id: containerId, expiration_date: inTwoDays });
    const res = await request(app)
      .get('/api/grocery-items?expiringSoon=3')
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(res.body.some((item: any) => item.name === 'Soon Yogurt')).toBe(true);
  });
  it('should create a grocery item attached to a container', async () => {
    // Create a product
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Yogurt', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
    const productId = prodRes.body.id;
    const res = await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send({ name: 'Yogurt Item', product_id: productId, container_id: containerId, quantity: 1 });
    expect(res.status).toBe(201);
    expect(res.body.container_id).toBe(containerId);
  });

  it('should update a grocery item to move it to another container', async () => {
    // Create another container
    const contRes = await db('container').insert({ name: 'Freezer', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
    const newContainerId = Array.isArray(contRes) ? contRes[0] : contRes;
    // Create a product and grocery item
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Butter', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
    const productId = prodRes.body.id;
    const createRes = await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send({ name: 'Butter Item', product_id: productId, container_id: containerId, quantity: 1 });
    const id = createRes.body.id;
    // Move item
    const res = await request(app)
      .put(`/api/grocery-items/${id}`)
      .set('Authorization', token)
      .send({ container_id: newContainerId });
    expect(res.status).toBe(200);
    expect(res.body.container_id).toBe(newContainerId);
  });

  it('should list all grocery items in a container', async () => {
    // Create a product and grocery item in container
    const prodRes = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: 'Cheese', created_by_user_id: global.testUserId, updated_by_user_id: global.testUserId });
    const productId = prodRes.body.id;
    await request(app)
      .post('/api/grocery-items')
      .set('Authorization', token)
      .send({ name: 'Cheese Item', product_id: productId, container_id: containerId, quantity: 1 });
    const res = await request(app)
      .get(`/api/grocery-items?container_id=${containerId}`)
      .set('Authorization', token);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((item: any) => item.name === 'Cheese Item')).toBe(true);
  });
let token: string;
let containerId: number;
let testUserId: number;
beforeAll(async () => {
  // Read the global test token from file
  const tokenPath = path.join('/tmp', 'grocodex_test_token.json');
  const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  token = `Bearer ${tokenData.token}`;
  testUserId = tokenData.userId;
  // Create a container for grocery items with required fields
  const containerRes = await db('container').insert({ name: 'Test Container', created_by_user_id: testUserId, updated_by_user_id: testUserId });
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
