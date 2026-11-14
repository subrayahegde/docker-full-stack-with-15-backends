package com.example.routes

import cats.effect.IO
import org.http4s.*
import org.http4s.dsl.io.*
import org.http4s.circe.CirceEntityCodec.*
import com.example.db.ProductRepository
import com.example.models.ProductRequest

object ProductRoutes:
  def routes(repo: ProductRepository): HttpRoutes[IO] =
    HttpRoutes.of[IO] {

      case GET -> Root / "products" =>
        repo.findAll.flatMap(products => Ok(products))

      case GET -> Root / "products" / IntVar(id) =>
        repo.findById(id).flatMap {
          case Some(product) => Ok(product)
          case None          => NotFound(s"Product with id $id not found")
        }

      case req @ POST -> Root / "products" =>
        for
          productReq <- req.as[ProductRequest]
          created    <- repo.create(productReq)
          resp       <- Created(created)
        yield resp

      case req @ PUT -> Root / "products" / IntVar(id) =>
        for
          productReq <- req.as[ProductRequest]
          updatedOpt <- repo.update(id, productReq)
          resp       <- updatedOpt match
                          case Some(updated) => Ok(updated)
                          case None          => NotFound(s"Product with id $id not found")
        yield resp

      case DELETE -> Root / "products" / IntVar(id) =>
        repo.delete(id).flatMap {
          case true  => NoContent()
          case false => NotFound(s"Product with id $id not found")
        }
    }
