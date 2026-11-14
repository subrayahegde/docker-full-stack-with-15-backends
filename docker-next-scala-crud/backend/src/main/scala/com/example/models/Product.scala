package com.example.models

import java.time.OffsetDateTime
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.*

case class Product(
  id: Int,
  name: String,
  description: Option[String],
  price: BigDecimal,
  createdAt: OffsetDateTime
)

object Product:
  given Encoder[Product] = deriveEncoder[Product]
  given Decoder[Product] = deriveDecoder[Product]

case class ProductRequest(
  name: String,
  description: Option[String],
  price: BigDecimal
)

object ProductRequest:
  given Decoder[ProductRequest] = deriveDecoder[ProductRequest]
