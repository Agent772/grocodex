import express from 'express';
import { requireAuth } from '../middleware/auth';
import * as storeModel from '../models/store';
import { storeSchema } from '../validation/store';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const parse = storeSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'ERR_VALIDATION' });
  try {
    const [store] = await storeModel.createStore({ ...parse.data, created_by_user_id: req.user.id });
    res.status(201).json(store);
  } catch (e) {
    res.status(500).json({ error: 'ERR_STORE_CREATE' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const stores = await storeModel.getStores({ name: req.query.name as string });
    res.json(stores);
  } catch (e) {
    res.status(500).json({ error: 'ERR_STORE_LIST' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const store = await storeModel.getStoreById(id);
  if (!store) return res.status(404).json({ error: 'ERR_STORE_NOT_FOUND' });
  res.json(store);
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const parse = storeSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'ERR_VALIDATION' });
  const [store] = await storeModel.updateStore(id, parse.data);
  if (!store) return res.status(404).json({ error: 'ERR_STORE_NOT_FOUND' });
  res.json(store);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const deleted = await storeModel.deleteStore(id);
  if (!deleted) return res.status(404).json({ error: 'ERR_STORE_NOT_FOUND' });
  res.json({ success: true });
});

export default router;
