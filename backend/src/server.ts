
import express from 'express';
import httpProxy from 'http-proxy-middleware';
import cors from 'cors';
import path from 'path';

const app = express();
const COUCHDB_URL = process.env.COUCHDB_URL || 'http://couchdb:5984';

// Serve static frontend files
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Allow CORS for local frontend (for API endpoints)
app.use(cors({ origin: true, credentials: true }));

// Proxy all CouchDB requests (future: add auth middleware here)
app.use('/couchdb', httpProxy.createProxyMiddleware({
  target: COUCHDB_URL,
  changeOrigin: true,
  pathRewrite: { '^/couchdb': '' },
  ws: true,
}));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Fallback to index.html for SPA routing
app.get('*', (_req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Grocodex app server running on port ${PORT}`);
});
