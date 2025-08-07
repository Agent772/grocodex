import categoryRoutes from './routes/categoryRoutes';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './swagger';
import 'dotenv/config';
import express from 'express';
import userRoutes from './routes/userRoutes';
import productRoutes from './routes/productRoutes';
import groceryItemRoutes from './routes/groceryItemRoutes';
import containerRoutes from './routes/containerRoutes';
import storeRoutes from './routes/storeRoutes';
import storeLocationRoutes from './routes/storeLocationRoutes';
import openFoodFactsRoutes from './routes/openFoodFactsRoutes';

const app = express();
const PORT = process.env.PORT || 3001;



app.use(express.json());

// Swagger UI route (available at /api-docs)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use('/api', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/grocery-items', groceryItemRoutes);
app.use('/api/containers', containerRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/store-locations', storeLocationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/openfoodfacts', openFoodFactsRoutes);


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
