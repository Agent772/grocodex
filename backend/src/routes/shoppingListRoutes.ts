import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import db from '../db';

const router = Router();

// Create shopping list
router.post('/', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'ERR_VALIDATION', message: 'Name is required' });
  try {
    const [id] = await db('shopping_list').insert({ name, created_by_user_id: req.user.id });
    const list = await db('shopping_list').where({ id }).first();
    res.status(201).json(list);
  } catch (err) {
    res.status(500).json({ error: 'ERR_DB', message: 'Failed to create shopping list' });
  }
});

// List all shopping lists for user
router.get('/', requireAuth, async (req, res) => {
  const lists = await db('shopping_list').where({ created_by_user_id: req.user.id });
  res.json(lists);
});

// Get shopping list by id
router.get('/:id', requireAuth, async (req, res) => {
  const list = await db('shopping_list').where({ id: req.params.id, created_by_user_id: req.user.id }).first();
  if (!list) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list not found' });
  res.json(list);
});

// Update shopping list
router.put('/:id', requireAuth, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'ERR_VALIDATION', message: 'Name is required' });
  const updated = await db('shopping_list')
    .where({ id: req.params.id, created_by_user_id: req.user.id })
    .update({ name });
  if (!updated) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list not found' });
  const list = await db('shopping_list').where({ id: req.params.id }).first();
  res.json(list);
});

// Delete shopping list
router.delete('/:id', requireAuth, async (req, res) => {
  const deleted = await db('shopping_list')
    .where({ id: req.params.id, created_by_user_id: req.user.id })
    .del();
  if (!deleted) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list not found' });
  res.status(204).send();
});

// Batch add items to shopping list
router.post('/:id/items/batch', requireAuth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'ERR_VALIDATION', message: 'Items array required' });
  }
  const list = await db('shopping_list').where({ id: req.params.id, created_by_user_id: req.user.id }).first();
  if (!list) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list not found' });
  try {
    const toInsert = items.map((item: any) => ({ ...item, shopping_list_id: req.params.id, created_by_user_id: req.user.id }));
    await db('shopping_list_item').insert(toInsert);
    const allItems = await db('shopping_list_item').where({ shopping_list_id: req.params.id });
    res.status(201).json(allItems);
  } catch (err) {
    res.status(500).json({ error: 'ERR_DB', message: 'Failed to add items' });
  }
});

export default router;
