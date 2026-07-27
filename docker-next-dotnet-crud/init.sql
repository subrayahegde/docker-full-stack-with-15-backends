CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (name, description, price) VALUES
('Premium Laptop', 'High-performance workstation', 1299.99),
('Wireless Mouse', 'Ergonomic 2.4GHz optical mouse', 29.99)
ON CONFLICT DO NOTHING;

