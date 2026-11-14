package com.example.db

import cats.effect.IO
import doobie.*
import doobie.implicits.*
import doobie.postgres.implicits.*
import com.example.models.{Product, ProductRequest}

class ProductRepository(xa: Transactor[IO]):

  def findAll: IO[List[Product]] =
    sql"SELECT id, name, description, price, created_at FROM products ORDER BY id"
      .query[Product]
      .to[List]
      .transact(xa)

  def findById(id: Int): IO[Option[Product]] =
    sql"SELECT id, name, description, price, created_at FROM products WHERE id = $id"
      .query[Product]
      .option
      .transact(xa)

  def create(req: ProductRequest): IO[Product] =
    sql"""
      INSERT INTO products (name, description, price)
      VALUES (${req.name}, ${req.description}, ${req.price})
      RETURNING id, name, description, price, created_at
    """
      .query[Product]
      .unique
      .transact(xa)

  def update(id: Int, req: ProductRequest): IO[Option[Product]] =
    sql"""
      UPDATE products
      SET name = ${req.name}, description = ${req.description}, price = ${req.price}
      WHERE id = $id
      RETURNING id, name, description, price, created_at
    """
      .query[Product]
      .option
      .transact(xa)

  def delete(id: Int): IO[Boolean] =
    sql"DELETE FROM products WHERE id = $id"
      .update
      .run
      .transact(xa)
      .map(_ > 0)
