import { Router } from 'express';
import axios from 'axios';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Proxy search by product name (Open Food Facts)
router.get('/search', requireAuth, async (req, res) => {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'ERR_VALIDATION', message: 'Missing or invalid name parameter' });
  }
  try {
    const response = await axios.get('https://world.openfoodfacts.org/cgi/search.pl', {
      params: {
        search_terms: name,
        search_simple: 1,
        action: 'process',
        json: 1,
        page_size: 10,
      },
    });
    const data = response.data as { products?: any[] };
    if (data.products && data.products.length > 0) {
      res.json(data.products);
    } else {
      res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'No products found' });
    }
  } catch (err) {
    res.status(502).json({ error: 'ERR_OPENFOODFACTS_UNAVAILABLE', message: 'Open Food Facts service unavailable' });
  }
});

// Proxy lookup for Open Food Facts
router.get('/barcode/:barcode', requireAuth, async (req, res) => {
  const { barcode } = req.params;
  try {
    const response = await axios.get(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = response.data as { status?: number; product?: any };
    if (data.status === 1) {
      res.json(data.product);
    } else {
      res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Product not found' });
    }
  } catch (err) {
    res.status(502).json({ error: 'ERR_OPENFOODFACTS_UNAVAILABLE', message: 'Open Food Facts service unavailable' });
  }
});

export default router;
