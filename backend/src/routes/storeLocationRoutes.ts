import express from 'express';
import { requireAuth } from '../middleware/auth';
import * as storeLocationModel from '../models/storeLocation';
import { storeLocationSchema } from '../validation/storeLocation';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const parse = storeLocationSchema.safeParse(req.body);
  if (!parse.success) {
    console.error('Validation failed:', parse.error);
    return res.status(400).json({ error: 'ERR_VALIDATION' });
  }
  try {
    const data = { ...parse.data, created_by_user_id: req.user.id };
    console.log('Creating store location with:', data);
    const [loc] = await storeLocationModel.createStoreLocation(data);
    res.status(201).json(loc);
  } catch (e) {
    console.error('Create store location error:', e);
    res.status(500).json({ error: 'ERR_STORE_LOCATION_CREATE' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const locations = await storeLocationModel.getStoreLocations({
      supermarket_id: req.query.supermarket_id ? Number(req.query.supermarket_id) : undefined,
      product_id: req.query.product_id ? Number(req.query.product_id) : undefined,
      location: req.query.location as string,
    });
    res.json(locations);
  } catch (e) {
    res.status(500).json({ error: 'ERR_STORE_LOCATION_LIST' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const loc = await storeLocationModel.getStoreLocationById(id);
  if (!loc) return res.status(404).json({ error: 'ERR_STORE_LOCATION_NOT_FOUND' });
  res.json(loc);
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const parse = storeLocationSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'ERR_VALIDATION' });
  const [loc] = await storeLocationModel.updateStoreLocation(id, parse.data);
  if (!loc) return res.status(404).json({ error: 'ERR_STORE_LOCATION_NOT_FOUND' });
  res.json(loc);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const deleted = await storeLocationModel.deleteStoreLocation(id);
  if (!deleted) return res.status(404).json({ error: 'ERR_STORE_LOCATION_NOT_FOUND' });
  res.json({ success: true });
});

export default router;
