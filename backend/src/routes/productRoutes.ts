import { Router } from 'express';

import { requireAuth } from '../middleware/auth';

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../models/product';
import { productSchema, productUpdateSchema } from '../validation/product';

const router = Router();


// Create product
router.post('/', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parse = productSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ERR_VALIDATION', details: parse.error.issues });
  }
  try {
    const product = await createProduct({
      ...parse.data,
      created_by_user_id: user.id,
      updated_by_user_id: user.id
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'ERR_PRODUCT_CREATE_FAILED' });
  }
});


// Read all products with optional filtering by name and category, and pagination
router.get('/', requireAuth, async (req, res) => {
  const { name, category, limit, offset } = req.query;
  try {
    let query = require('../db').default('product');
    if (name) {
      query = query.where('name', 'like', `%${name}%`);
    }
    if (category) {
      query = query.where('category', category);
    }
    if (limit) {
      query = query.limit(Number(limit));
    }
    if (offset) {
      query = query.offset(Number(offset));
    }
    const products = await query.select('*');
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'ERR_PRODUCT_LIST_FAILED' });
  }
});


// Read single product
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    const product = await getProductById(id);
    if (!product) return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'ERR_PRODUCT_FETCH_FAILED' });
  }
});


// Update product
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const parse = productUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ERR_VALIDATION', details: parse.error.issues });
  }
  const user = (req as any).user;
  const updates = { ...parse.data, updated_by_user_id: user.id };
  try {
    const count = await updateProduct(id, updates);
    if (!count) return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND' });
    const updated = await getProductById(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'ERR_PRODUCT_UPDATE_FAILED' });
  }
});


// Delete product
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    // Check for grocery items referencing this product
    const groceryItems = await require('../db').default('grocery_item').where({ product_id: id }).first();
    if (groceryItems) {
      return res.status(409).json({ error: 'ERR_PRODUCT_IN_USE' });
    }
    const count = await deleteProduct(id);
    if (!count) return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND' });
    res.json({ success: true });
  } catch (err) {

    res.status(500).json({ error: 'ERR_PRODUCT_DELETE_FAILED' });
  }
});

// Cascading delete: delete all grocery items for a product, then the product
router.delete('/:id/cascade', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    // Delete all grocery items for this product
    await require('../db').default('grocery_item').where({ product_id: id }).del();
    // Now delete the product
    const count = await deleteProduct(id);
    if (!count) return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_PRODUCT_CASCADE_DELETE_FAILED' });
  }
});

// Cascading delete: delete all grocery items for a product, then the product
router.delete('/:id/cascade', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    // Delete all grocery items for this product
    await require('../db').default('grocery_item').where({ product_id: id }).del();
    // Now delete the product
    const count = await deleteProduct(id);
    if (!count) return res.status(404).json({ error: 'ERR_PRODUCT_NOT_FOUND' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_PRODUCT_CASCADE_DELETE_FAILED' });
  }
});

export default router;
