
package com.example.resource;

import com.example.dto.ProductRequest;
import com.example.dto.ProductResponse;
import com.example.entity.Product;
import io.quarkus.panache.common.Sort;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Map;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @GET
    public List<ProductResponse> listProducts() {
        return Product.<Product>listAll(Sort.ascending("id"))
            .stream()
            .map(ProductResponse::from)
            .toList();
    }

    @GET
    @Path("/{id}")
    public ProductResponse getProduct(@PathParam("id") Integer id) {
        Product product = Product.findById(id);
        if (product == null) {
            throw new NotFoundException("Product not found");
        }
        return ProductResponse.from(product);
    }

    @POST
    @Transactional
    public Response createProduct(@Valid ProductRequest request) {
        if (request == null || request.name() == null || request.name().isBlank()) {
            throw new BadRequestException("Name is required");
        }
        if (request.price() == null) {
            throw new BadRequestException("Price is required");
        }

        Product product = new Product();
        product.name = request.name().trim();
        product.description = request.description();
        product.price = request.price();
        product.persist();

        return Response.status(Response.Status.CREATED)
            .entity(ProductResponse.from(product))
            .build();
    }

    @PUT
    @Path("/{id}")
    @Transactional
    public ProductResponse updateProduct(@PathParam("id") Integer id, @Valid ProductRequest request) {
        if (request == null || (request.name() == null && request.description() == null && request.price() == null)) {
            throw new BadRequestException("No fields provided for update");
        }

        Product product = Product.findById(id);
        if (product == null) {
            throw new NotFoundException("Product not found");
        }

        if (request.name() != null) {
            if (request.name().isBlank()) {
                throw new BadRequestException("Name cannot be blank");
            }
            product.name = request.name().trim();
        }
        if (request.description() != null) {
            product.description = request.description();
        }
        if (request.price() != null) {
            product.price = request.price();
        }

        return ProductResponse.from(product);
    }

    @DELETE
    @Path("/{id}")
    @Transactional
    public Map<String, String> deleteProduct(@PathParam("id") Integer id) {
        boolean deleted = Product.deleteById(id);
        if (!deleted) {
            throw new NotFoundException("Product not found");
        }
        return Map.of("message", "Product deleted successfully");
    }
}
