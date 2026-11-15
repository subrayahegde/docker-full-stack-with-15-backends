import { serve } from '@hono/node-server';
import app from './app.js';
import { pool } from './db/index.js';

const port = Number(process.env.PORT) || 5000;

const server = serve({
  fetch: app.fetch,
  port,
});

console.log(`Hono backend running on port ${port}`);

const shutdown = async () => {
  server.close();
  await pool.end();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

