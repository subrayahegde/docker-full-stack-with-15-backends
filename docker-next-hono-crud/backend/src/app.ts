import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import products from './routes/products.js';

const app = new Hono();

app.use('*', logger());
app.use(
  '/api/*',
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  })
);

app.get('/health', (c) => c.json({ status: 'ok' }));
app.route('/api/products', products);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;

