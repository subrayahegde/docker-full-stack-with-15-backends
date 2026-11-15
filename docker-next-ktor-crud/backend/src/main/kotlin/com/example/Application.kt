package com.example

import com.example.db.DatabaseFactory
import com.example.models.ErrorResponse
import com.example.routes.productRoutes
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.plugins.*
import io.ktor.server.plugins.calllogging.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import java.net.URI

fun main() {
    val port = System.getenv("PORT")?.toIntOrNull() ?: 5000

    embeddedServer(Netty, port = port, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    DatabaseFactory.init()

    monitor.subscribe(ApplicationStopped) {
        DatabaseFactory.close()
    }

    install(CallLogging)

    install(ContentNegotiation) {
        json(Json {
            prettyPrint = false
            ignoreUnknownKeys = true
        })
    }

    val corsOrigin = System.getenv("CORS_ORIGIN") ?: "http://localhost:3000"
    val parsedOrigin = URI(corsOrigin)
    install(CORS) {
        allowHost("${parsedOrigin.host}:${parsedOrigin.port}", schemes = listOf(parsedOrigin.scheme))
        allowHeader(HttpHeaders.ContentType)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        allowMethod(HttpMethod.Options)
    }

    install(StatusPages) {
        exception<BadRequestException> { call, cause ->
            call.respond(HttpStatusCode.BadRequest, ErrorResponse(cause.message ?: "Invalid request body"))
        }
        exception<Throwable> { call, cause ->
            this@module.log.error("Unhandled exception", cause)
            call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Internal Server Error"))
        }
    }

    routing {
        get("/health") {
            call.respond(HttpStatusCode.OK, mapOf("status" to "ok"))
        }
        productRoutes()
    }
}

