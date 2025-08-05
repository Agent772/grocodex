import express from 'express';
import db from './db';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Example: List all users
app.get('/api/users', async (_req, res) => {
  try {
    const users = await db('user').select('id', 'username', 'created_at');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.listen(PORT, () => {
  console.log(`Grocodex backend running on port ${PORT}`);
});
