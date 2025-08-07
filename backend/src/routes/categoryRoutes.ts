import express from 'express';
import { requireAuth } from '../middleware/auth';
import * as categoryModel from '../models/category';
import { categorySchema } from '../validation/category';

const router = express.Router();

router.post('/', requireAuth, async (req, res) => {
  const parse = categorySchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'ERR_VALIDATION' });
  try {
    const [cat] = await categoryModel.createCategory({ ...parse.data, created_by_user_id: req.user.id });
    res.status(201).json(cat);
  } catch (e) {
    res.status(500).json({ error: 'ERR_CATEGORY_CREATE' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const categories = await categoryModel.getCategories({ name: req.query.name as string });
    res.json(categories);
  } catch (e) {
    res.status(500).json({ error: 'ERR_CATEGORY_LIST' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const cat = await categoryModel.getCategoryById(id);
  if (!cat) return res.status(404).json({ error: 'ERR_CATEGORY_NOT_FOUND' });
  res.json(cat);
});

router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const parse = categorySchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'ERR_VALIDATION' });
  const [cat] = await categoryModel.updateCategory(id, parse.data);
  if (!cat) return res.status(404).json({ error: 'ERR_CATEGORY_NOT_FOUND' });
  res.json(cat);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const deleted = await categoryModel.deleteCategory(id);
  if (!deleted) return res.status(404).json({ error: 'ERR_CATEGORY_NOT_FOUND' });
  res.json({ success: true });
});

export default router;
