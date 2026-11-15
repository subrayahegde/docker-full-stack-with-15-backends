package com.example.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record ProductRequest(
    @Size(min = 1, max = 100, message = "Name must be between 1 and 100 characters")
    String name,

    String description,

    @DecimalMin(value = "0.00", message = "Price must be 0 or greater")
    @Digits(integer = 8, fraction = 2, message = "Price must have up to 8 integer digits and 2 decimal places")
    BigDecimal price
) {}
