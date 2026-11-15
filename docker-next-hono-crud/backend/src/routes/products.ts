import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { pool } from '../db/index.js';
import {
  createProductSchema,
  updateProductSchema,
  idParamSchema,
} from '../schemas/product.schema.js';

const products = new Hono();

// GET /api/products - List all products
products.get('/', async (c) => {
  const { rows } = await pool.query(
    'SELECT id, name, description, price, created_at FROM products ORDER BY id ASC'
  );
  return c.json(rows);
});

// GET /api/products/:id - Get single product
products.get('/:id', zValidator('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { rows } = await pool.query(
    'SELECT id, name, description, price, created_at FROM products WHERE id = $1',
    [id]
  );

  if (rows.length === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }
  return c.json(rows[0]);
});

// POST /api/products - Create product
products.post('/', zValidator('json', createProductSchema), async (c) => {
  const { name, description, price } = c.req.valid('json');
  const { rows } = await pool.query(
    `INSERT INTO products (name, description, price)
     VALUES ($1, $2, $3)
     RETURNING id, name, description, price, created_at`,
    [name, description ?? null, price]
  );
  return c.json(rows[0], 201);
});

// PUT /api/products/:id - Update product
products.put(
  '/:id',
  zValidator('param', idParamSchema),
  zValidator('json', updateProductSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');

    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (data.name !== undefined) {
      fields.push(`name = $${idx++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push(`price = $${idx++}`);
      values.push(data.price);
    }

    if (fields.length === 0) {
      return c.json({ error: 'No fields provided for update' }, 400);
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE products SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING id, name, description, price, created_at`,
      values
    );

    if (rows.length === 0) {
      return c.json({ error: 'Product not found' }, 404);
    }
    return c.json(rows[0]);
  }
);

// DELETE /api/products/:id - Delete product
products.delete('/:id', zValidator('param', idParamSchema), async (c) => {
  const { id } = c.req.valid('param');
  const { rowCount } = await pool.query('DELETE FROM products WHERE id = $1', [
    id,
  ]);

  if (rowCount === 0) {
    return c.json({ error: 'Product not found' }, 404);
  }
  return c.json({ message: 'Product deleted successfully' });
});

export default products;

