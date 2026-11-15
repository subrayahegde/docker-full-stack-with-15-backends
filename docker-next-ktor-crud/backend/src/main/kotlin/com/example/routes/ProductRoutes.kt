package com.example.routes

import com.example.db.DatabaseFactory.dbQuery
import com.example.models.*
import io.ktor.http.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.jetbrains.exposed.v1.core.SortOrder
import org.jetbrains.exposed.v1.core.eq
import org.jetbrains.exposed.v1.jdbc.deleteWhere
import org.jetbrains.exposed.v1.jdbc.insert
import org.jetbrains.exposed.v1.jdbc.selectAll
import org.jetbrains.exposed.v1.jdbc.update
import java.math.BigDecimal
import java.math.RoundingMode

fun Route.productRoutes() {
    route("/api/products") {

        // GET /api/products - List all products
        get {
            val products = dbQuery {
                ProductsTable
                    .selectAll()
                    .orderBy(ProductsTable.id to SortOrder.ASC)
                    .map { it.toProductResponse() }
            }
            call.respond(HttpStatusCode.OK, products)
        }

        // GET /api/products/{id} - Get single product
        get("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: return@get call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid product ID"))

            val product = dbQuery {
                ProductsTable
                    .selectAll()
                    .where { ProductsTable.id eq id }
                    .map { it.toProductResponse() }
                    .singleOrNull()
            }

            if (product == null) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Product not found"))
            } else {
                call.respond(HttpStatusCode.OK, product)
            }
        }

        // POST /api/products - Create product
        post {
            val req = call.receive<CreateProductRequest>()

            if (req.name.isBlank() || req.name.length > 100) {
                return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("Name is required and must be 100 characters or fewer")
                )
            }
            if (req.price < 0) {
                return@post call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("Price must be 0 or greater")
                )
            }

            val created = dbQuery {
                val stmt = ProductsTable.insert {
                    it[name] = req.name.trim()
                    it[description] = req.description
                    it[price] = BigDecimal.valueOf(req.price).setScale(2, RoundingMode.HALF_UP)
                }
                stmt.resultedValues?.singleOrNull()?.toProductResponse()
            }

            if (created != null) {
                call.respond(HttpStatusCode.Created, created)
            } else {
                call.respond(HttpStatusCode.InternalServerError, ErrorResponse("Failed to create product"))
            }
        }

        // PUT /api/products/{id} - Update product
        put("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: return@put call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid product ID"))

            val req = call.receive<UpdateProductRequest>()

            if (req.name == null && req.description == null && req.price == null) {
                return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("No fields provided for update")
                )
            }
            if (req.name != null && (req.name.isBlank() || req.name.length > 100)) {
                return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("Name must be between 1 and 100 characters")
                )
            }
            if (req.price != null && req.price < 0) {
                return@put call.respond(
                    HttpStatusCode.BadRequest,
                    ErrorResponse("Price must be 0 or greater")
                )
            }

            val updated = dbQuery {
                val rowsUpdated = ProductsTable.update({ ProductsTable.id eq id }) {
                    req.name?.let { value -> it[name] = value.trim() }
                    if (req.description != null) {
                        it[description] = req.description
                    }
                    req.price?.let { value ->
                        it[price] = BigDecimal.valueOf(value).setScale(2, RoundingMode.HALF_UP)
                    }
                }

                if (rowsUpdated > 0) {
                    ProductsTable
                        .selectAll()
                        .where { ProductsTable.id eq id }
                        .map { it.toProductResponse() }
                        .singleOrNull()
                } else {
                    null
                }
            }

            if (updated == null) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Product not found"))
            } else {
                call.respond(HttpStatusCode.OK, updated)
            }
        }

        // DELETE /api/products/{id} - Delete product
        delete("/{id}") {
            val id = call.parameters["id"]?.toIntOrNull()
                ?: return@delete call.respond(HttpStatusCode.BadRequest, ErrorResponse("Invalid product ID"))

            val deletedCount = dbQuery {
                ProductsTable.deleteWhere { ProductsTable.id eq id }
            }

            if (deletedCount == 0) {
                call.respond(HttpStatusCode.NotFound, ErrorResponse("Product not found"))
            } else {
                call.respond(HttpStatusCode.OK, MessageResponse("Product deleted successfully"))
            }
        }
    }
}

