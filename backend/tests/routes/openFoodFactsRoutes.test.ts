
import request from 'supertest';
import app from '../../src/index';
import fs from 'fs';
import path from 'path';

let token: string;
beforeAll(() => {
  // Read the global test token from file
  const tokenPath = path.join('/tmp', 'grocodex_test_token.json');
  const tokenData = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  token = `Bearer ${tokenData.token}`;
});

describe('OpenFoodFacts Routes (Proxy)', () => {
  describe('Barcode Lookup', () => {
    it('should return product data for a valid barcode', async () => {
      const res = await request(app)
        .get('/api/openfoodfacts/barcode/737628064502')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body).toHaveProperty('product_name');
      } else {
        expect(res.body).toHaveProperty('error', 'ERR_NOT_FOUND');
      }
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/openfoodfacts/barcode/737628064502');
      expect(res.statusCode).toBe(401);
    });

    it('should return 502 if Open Food Facts is unavailable', async () => {
      jest.spyOn(require('axios'), 'get').mockRejectedValueOnce(new Error('Network error'));
      const res = await request(app)
        .get('/api/openfoodfacts/barcode/000000000000')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(502);
      expect(res.body).toHaveProperty('error', 'ERR_OPENFOODFACTS_UNAVAILABLE');
    });
  });

  describe('Product Name Search', () => {
    it('should return products for a valid name search', async () => {
      const res = await request(app)
        .get('/api/openfoodfacts/search?name=coca-cola')
        .set('Authorization', `Bearer ${token}`);
      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(Array.isArray(res.body)).toBe(true);
      } else {
        expect(res.body).toHaveProperty('error', 'ERR_NOT_FOUND');
      }
    });

    it('should return 400 for missing name parameter', async () => {
      const res = await request(app)
        .get('/api/openfoodfacts/search')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('error', 'ERR_VALIDATION');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app).get('/api/openfoodfacts/search?name=coca-cola');
      expect(res.statusCode).toBe(401);
    });

    it('should return 502 if Open Food Facts is unavailable', async () => {
      jest.spyOn(require('axios'), 'get').mockRejectedValueOnce(new Error('Network error'));
      const res = await request(app)
        .get('/api/openfoodfacts/search?name=coca-cola')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(502);
      expect(res.body).toHaveProperty('error', 'ERR_OPENFOODFACTS_UNAVAILABLE');
    });
  });
});
