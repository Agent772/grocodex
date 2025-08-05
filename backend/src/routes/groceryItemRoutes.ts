import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createGroceryItem,
  getAllGroceryItems,
  getGroceryItemById,
  updateGroceryItem,
  deleteGroceryItem
} from '../models/groceryItem';
import { groceryItemSchema, groceryItemUpdateSchema } from '../validation/groceryItem';

const router = Router();


// Create grocery item
router.post('/', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parse = groceryItemSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ERR_VALIDATION', details: parse.error.issues });
  }
  try {
    const item = await createGroceryItem({
      ...parse.data,
      added_by_user_id: user.id,
      created_by_user_id: user.id,
      updated_by_user_id: user.id
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'ERR_GROCERY_ITEM_CREATE_FAILED' });
  }
});


// Read all grocery items with optional filtering by product_id or product name, and pagination
router.get('/', requireAuth, async (req, res) => {
  const { product_id, name, limit, offset } = req.query;
  try {
    let query = require('../db').default('grocery_item');
    if (product_id) {
      query = query.where('product_id', product_id);
    }
    if (name) {
      // Join with product table for name search
      query = query.join('product', 'grocery_item.product_id', 'product.id')
        .where('product.name', 'like', `%${name}%`)
        .select('grocery_item.*');
    }
    if (limit) {
      query = query.limit(Number(limit));
    }
    if (offset) {
      query = query.offset(Number(offset));
    }
    const items = await query.select('*');
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'ERR_GROCERY_ITEM_LIST_FAILED' });
  }
});


// Read single grocery item
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    const item = await getGroceryItemById(id);
    if (!item) return res.status(404).json({ error: 'ERR_GROCERY_ITEM_NOT_FOUND' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'ERR_GROCERY_ITEM_FETCH_FAILED' });
  }
});


// Update grocery item
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const parse = groceryItemUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ERR_VALIDATION', details: parse.error.issues });
  }
  const user = (req as any).user;
  const updates = { ...parse.data, updated_by_user_id: user.id };
  try {
    const count = await updateGroceryItem(id, updates);
    if (!count) return res.status(404).json({ error: 'ERR_GROCERY_ITEM_NOT_FOUND' });
    const updated = await getGroceryItemById(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'ERR_GROCERY_ITEM_UPDATE_FAILED' });
  }
});


// Delete grocery item
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    const count = await deleteGroceryItem(id);
    if (!count) return res.status(404).json({ error: 'ERR_GROCERY_ITEM_NOT_FOUND' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_GROCERY_ITEM_DELETE_FAILED' });
  }
});

export default router;
