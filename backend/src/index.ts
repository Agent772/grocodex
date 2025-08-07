import 'dotenv/config';
import express from 'express';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import groceryItemRoutes from './routes/groceryItemRoutes';
import containerRoutes from './routes/containerRoutes';

const app = express();
const PORT = process.env.PORT || 3001;


app.use(express.json());


// User-related routes

// User-related routes
app.use('/api', userRoutes);
// Product-related routes
app.use('/api/products', productRoutes);
// Grocery item-related routes
app.use('/api/grocery-items', groceryItemRoutes);


// Container-related routes
app.use('/api/containers', containerRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});



if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Grocodex backend running on port ${PORT}`);
  });
}

export default app;
