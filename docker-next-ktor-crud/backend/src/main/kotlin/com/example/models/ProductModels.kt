package com.example.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import org.jetbrains.exposed.v1.core.ResultRow
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.CurrentTimestampWithTimeZone
import org.jetbrains.exposed.v1.javatime.timestampWithTimeZone

object ProductsTable : Table("products") {
    val id = integer("id").autoIncrement()
    val name = varchar("name", 100)
    val description = text("description").nullable()
    val price = decimal("price", 10, 2)
    val createdAt = timestampWithTimeZone("created_at")
        .defaultExpression(CurrentTimestampWithTimeZone)

    override val primaryKey = PrimaryKey(id)
}

@Serializable
data class ProductResponse(
    val id: Int,
    val name: String,
    val description: String? = null,
    val price: Double,
    @SerialName("created_at")
    val createdAt: String
)

@Serializable
data class CreateProductRequest(
    val name: String,
    val description: String? = null,
    val price: Double
)

@Serializable
data class UpdateProductRequest(
    val name: String? = null,
    val description: String? = null,
    val price: Double? = null
)

@Serializable
data class MessageResponse(
    val message: String
)

@Serializable
data class ErrorResponse(
    val error: String
)

fun ResultRow.toProductResponse(): ProductResponse = ProductResponse(
    id = this[ProductsTable.id],
    name = this[ProductsTable.name],
    description = this[ProductsTable.description],
    price = this[ProductsTable.price].toDouble(),
    createdAt = this[ProductsTable.createdAt].toString()
)

