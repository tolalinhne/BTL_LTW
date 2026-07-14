package com.lilifashion.module.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    private String name;

    private String slug; // auto-generated if blank

    private String sku;
    private String description;
    private String detailedDescription;

    @NotNull(message = "Giá sản phẩm không được để trống")
    @Positive(message = "Giá sản phẩm phải lớn hơn 0")
    private BigDecimal price;

    private BigDecimal originalPrice;

    private Long categoryId;
    private String categorySlug; // alternative to categoryId

    private String status; // ACTIVE, DRAFT

    private List<VariantRequest> variants;
    private List<String> imageUrls;
    private String primaryImageUrl;

    @Data
    public static class VariantRequest {
        private Long id; // existing variant id for update
        @NotBlank
        private String size;
        @NotBlank
        private String color;
        private String colorHex;
        private Integer stock;
        private String sku;
        private String imageUrl; // optional per-variant image
    }
}
