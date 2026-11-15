
package com.example.dto;

import com.example.entity.Product;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record ProductResponse(
    Integer id,
    String name,
    String description,
    BigDecimal price,
    @JsonProperty("created_at")
    OffsetDateTime createdAt
) {
    public static ProductResponse from(Product product) {
        return new ProductResponse(
            product.id,
            product.name,
            product.description,
            product.price,
            product.createdAt
        );
    }
}
