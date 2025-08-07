import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  createContainer,
  getAllContainers,
  getContainerById,
  updateContainer,
  deleteContainer
} from '../models/container';
import { containerSchema, containerUpdateSchema } from '../validation/container';

const router = Router();

// Create container
router.post('/', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const parse = containerSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ERR_VALIDATION', details: parse.error.issues });
  }
  try {
    const container = await createContainer({
      ...parse.data,
      created_by_user_id: user.id,
      updated_by_user_id: user.id
    });
    res.status(201).json(container);
  } catch (err) {
    res.status(500).json({ error: 'ERR_CONTAINER_CREATE_FAILED' });
  }
});

// Get all containers
router.get('/', requireAuth, async (_req, res) => {
  try {
    const containers = await getAllContainers();
    res.json(containers);
  } catch (err) {
    res.status(500).json({ error: 'ERR_CONTAINER_LIST_FAILED' });
  }
});

// Get single container
router.get('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    const container = await getContainerById(id);
    if (!container) return res.status(404).json({ error: 'ERR_CONTAINER_NOT_FOUND' });
    res.json(container);
  } catch (err) {
    res.status(500).json({ error: 'ERR_CONTAINER_FETCH_FAILED' });
  }
});

// Update container
router.put('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  const parse = containerUpdateSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'ERR_VALIDATION', details: parse.error.issues });
  }
  const user = (req as any).user;
  const updates = { ...parse.data, updated_by_user_id: user.id };
  try {
    const count = await updateContainer(id, updates);
    if (!count) return res.status(404).json({ error: 'ERR_CONTAINER_NOT_FOUND' });
    const updated = await getContainerById(id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'ERR_CONTAINER_UPDATE_FAILED' });
  }
});

// Delete container
router.delete('/:id', requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'ERR_INVALID_ID' });
  try {
    const count = await deleteContainer(id);
    if (!count) return res.status(404).json({ error: 'ERR_CONTAINER_NOT_FOUND' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'ERR_CONTAINER_DELETE_FAILED' });
  }
});

export default router;
