
import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import db from '../db';

const router = Router();

// Batch mark items as complete
router.post('/batch/complete', requireAuth, async (req, res) => {
  const { item_ids } = req.body;
  if (!Array.isArray(item_ids) || item_ids.length === 0) {
    return res.status(400).json({ error: 'ERR_VALIDATION', message: 'item_ids array required' });
  }
  try {
    await db('shopping_list_item')
      .whereIn('id', item_ids)
      .andWhere('created_by_user_id', req.user.id)
      .update({ completed: 1 });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_DB', message: 'Failed to mark items as complete' });
  }
});

// Batch delete all items from a shopping list
router.delete('/batch/list/:shopping_list_id', requireAuth, async (req, res) => {
  const { shopping_list_id } = req.params;
  try {
    await db('shopping_list_item')
      .where('shopping_list_id', shopping_list_id)
      .andWhere('created_by_user_id', req.user.id)
      .del();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_DB', message: 'Failed to delete items' });
  }
});

// Get all shopping list items with product and store info
router.get('/details/all', requireAuth, async (req, res) => {
  const { shopping_list_id, product_id, q } = req.query;
  let query = db('shopping_list_item as sli')
    .leftJoin('product as p', 'sli.product_id', 'p.id')
    .leftJoin('supermarket_product as sp', 'p.id', 'sp.product_id')
    .leftJoin('supermarket as s', 'sp.supermarket_id', 's.id')
    .select(
      'sli.id as sli_id',
      'sli.shopping_list_id',
      'sli.product_id as sli_product_id',
      'sli.quantity',
      'sli.unit',
      'sli.comment',
      'sli.image_url',
      'sli.created_by_user_id',
      'sli.created_at',
      'sli.updated_at',
      'p.id as product_id',
      's.id as store_id',
      db.raw('json_object("pid", p.id, "name", p.name, "brand", p.brand, "barcode", p.barcode, "image_url", p.image_url) as product'),
      db.raw('json_object("sid", s.id, "name", s.name, "location", s.location) as store')
    )
    .where('sli.created_by_user_id', req.user.id);
  if (shopping_list_id) query = query.andWhere('sli.shopping_list_id', shopping_list_id as string);
  if (product_id) query = query.andWhere('sli.product_id', product_id as string);
  if (q) query = query.andWhere('sli.comment', 'like', `%${q}%`);
  const items = await query;
  // Parse JSON fields
  const result = items.map((item: any) => ({ ...item, product: JSON.parse(item.product), store: item.store ? JSON.parse(item.store) : null }));
  res.json(result);
});

// Get single shopping list item with product and store info
router.get('/:id/details', requireAuth, async (req, res) => {
  const item = await db('shopping_list_item as sli')
    .leftJoin('product as p', 'sli.product_id', 'p.id')
    .leftJoin('supermarket_product as sp', 'p.id', 'sp.product_id')
    .leftJoin('supermarket as s', 'sp.supermarket_id', 's.id')
    .select(
      'sli.id as sli_id',
      'sli.shopping_list_id',
      'sli.product_id as sli_product_id',
      'sli.quantity',
      'sli.unit',
      'sli.comment',
      'sli.image_url',
      'sli.created_by_user_id',
      'sli.created_at',
      'sli.updated_at',
      'p.id as product_id',
      's.id as store_id',
      db.raw('json_object("pid", p.id, "name", p.name, "brand", p.brand, "barcode", p.barcode, "image_url", p.image_url) as product'),
      db.raw('json_object("sid", s.id, "name", s.name, "location", s.location) as store')
    )
    .where('sli.id', req.params.id)
    .andWhere('sli.created_by_user_id', req.user.id)
    .first();
  if (!item) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list item not found' });
  res.json({ ...item, product: JSON.parse(item.product), store: item.store ? JSON.parse(item.store) : null });
});

// Create shopping list item
router.post('/', requireAuth, async (req, res) => {
  const { shopping_list_id, product_id, quantity, unit, comment, image_url } = req.body;
  if (!shopping_list_id || !product_id) {
    return res.status(400).json({ error: 'ERR_VALIDATION', message: 'shopping_list_id and product_id are required' });
  }
  try {
    const [id] = await db('shopping_list_item').insert({
      shopping_list_id,
      product_id,
      quantity,
      unit,
      comment,
      image_url,
      created_by_user_id: req.user.id,
    });
    const item = await db('shopping_list_item').where({ id }).first();
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'ERR_DB', message: 'Failed to create shopping list item' });
  }
});

// List/search shopping list items
router.get('/', requireAuth, async (req, res) => {
  const { shopping_list_id, product_id, q } = req.query;
  let query = db('shopping_list_item').where({ created_by_user_id: req.user.id });
  if (shopping_list_id) query = query.andWhere('shopping_list_id', shopping_list_id as string);
  if (product_id) query = query.andWhere('product_id', product_id as string);
  if (q) query = query.andWhere('comment', 'like', `%${q}%`);
  const items = await query;
  res.json(items);
});

// Get shopping list item by id
router.get('/:id', requireAuth, async (req, res) => {
  const item = await db('shopping_list_item').where({ id: req.params.id, created_by_user_id: req.user.id }).first();
  if (!item) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list item not found' });
  res.json(item);
});

// Update shopping list item
router.put('/:id', requireAuth, async (req, res) => {
  const updates = req.body;
  const updated = await db('shopping_list_item')
    .where({ id: req.params.id, created_by_user_id: req.user.id })
    .update(updates);
  if (!updated) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list item not found' });
  const item = await db('shopping_list_item').where({ id: req.params.id }).first();
  res.json(item);
});

// Delete shopping list item
router.delete('/:id', requireAuth, async (req, res) => {
  const deleted = await db('shopping_list_item')
    .where({ id: req.params.id, created_by_user_id: req.user.id })
    .del();
  if (!deleted) return res.status(404).json({ error: 'ERR_NOT_FOUND', message: 'Shopping list item not found' });
  res.status(204).send();
});

// Batch add items
router.post('/batch', requireAuth, async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'ERR_VALIDATION', message: 'Items array required' });
  }
  try {
    const toInsert = items.map((item: any) => ({ ...item, created_by_user_id: req.user.id }));
    await db('shopping_list_item').insert(toInsert);
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_DB', message: 'Failed to add items' });
  }
});

export default router;
