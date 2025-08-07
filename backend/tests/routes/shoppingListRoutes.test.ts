import request from 'supertest';
import app from '../../src/index';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const token = jwt.sign({ userId: 1 }, JWT_SECRET);

describe('Shopping List Routes', () => {
  let listId: number;

  it('should create a shopping list', async () => {
    const res = await request(app)
      .post('/api/shopping-lists')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Weekly Groceries' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    listId = res.body.id;
  });

  it('should list all shopping lists for user', async () => {
    const res = await request(app)
      .get('/api/shopping-lists')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a shopping list by id', async () => {
    const res = await request(app)
      .get(`/api/shopping-lists/${listId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', listId);
  });

  it('should update a shopping list', async () => {
    const res = await request(app)
      .put(`/api/shopping-lists/${listId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated List' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('name', 'Updated List');
  });

  it('should batch add items to a shopping list', async () => {
    const items = [
      { product_id: 1, quantity: 2, unit: 'pcs', comment: 'Fresh', image_url: '' },
      { product_id: 2, quantity: 1, unit: 'kg', comment: '', image_url: '' }
    ];
    const res = await request(app)
      .post(`/api/shopping-lists/${listId}/items/batch`)
      .set('Authorization', `Bearer ${token}`)
      .send({ items });
    expect(res.statusCode).toBe(201);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it('should delete a shopping list', async () => {
    const res = await request(app)
      .delete(`/api/shopping-lists/${listId}`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(204);
  });
});
