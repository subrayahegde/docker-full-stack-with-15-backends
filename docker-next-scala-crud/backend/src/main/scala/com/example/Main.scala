package com.example

import cats.effect.*
import com.comcast.ip4s.*
import doobie.hikari.HikariTransactor
import doobie.implicits.*
import doobie.util.ExecutionContexts
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.implicits.*
import org.http4s.server.Router
import org.http4s.server.middleware.CORS
import com.example.db.ProductRepository
import com.example.routes.ProductRoutes

object Main extends IOApp.Simple:

  val dbUrl   = sys.env.getOrElse("DB_URL", "jdbc:postgresql://database:5432/clidb")
  val dbUser  = sys.env.getOrElse("DB_USER", "postgres")
  val dbPass  = sys.env.getOrElse("DB_PASSWORD", "Pass123")
  val appPort = sys.env.get("PORT").flatMap(Port.fromString).getOrElse(port"5000")

  def transactorResource: Resource[IO, HikariTransactor[IO]] =
    for
      ce <- ExecutionContexts.fixedThreadPool[IO](32)
      xa <- HikariTransactor.newHikariTransactor[IO](
              "org.postgresql.Driver",
              dbUrl,
              dbUser,
              dbPass,
              ce
            )
    yield xa

  override def run: IO[Unit] =
    transactorResource.use { xa =>
      val repo = ProductRepository(xa)

      // Mount routes under /api -> http://localhost:5000/api/products
      val apiRoutes = Router(
        "/api" -> ProductRoutes.routes(repo)
      ).orNotFound

      val httpApp = CORS.policy
        .withAllowOriginAll
        .withAllowMethodsAll
        .withAllowHeadersAll
        .apply(apiRoutes)

      for
        _ <- sql"SELECT 1".query[Int].unique.transact(xa)
        _ <- IO.println(s"✅ Successfully connected to PostgreSQL at $dbUrl")
        _ <- IO.println(s"🚀 Server starting on http://0.0.0:$appPort/api/products")
        _ <- EmberServerBuilder
               .default[IO]
               .withHost(ipv4"0.0.0.0")
               .withPort(appPort)
               .withHttpApp(httpApp)
               .build
               .useForever
      yield ()
    }
