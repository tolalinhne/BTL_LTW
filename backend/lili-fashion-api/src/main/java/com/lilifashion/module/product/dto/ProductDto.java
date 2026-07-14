package com.lilifashion.module.product.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.entity.ProductImage;
import com.lilifashion.module.product.entity.ProductVariant;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private Long id;
    private String name;
    private String slug;
    private String sku;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private String image;
    private String category;
    private String categorySlug;
    private String description;
    private String detailedDescription;
    private String status;
    private Integer soldCount;
    private Double avgRating;
    private Integer reviewCount;
    private Integer stock; // Tổng tồn kho
    @JsonProperty("isNew")
    private boolean isNew;
    @JsonProperty("isBestSeller")
    private boolean isBestSeller;
    private List<VariantDto> variants;
    private List<String> images;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VariantDto {
        private Long id;
        private String size;
        private String color;
        private String colorHex;
        private Integer stock;
        private String sku;
        private String imageUrl; // per-variant image
    }

    public static ProductDto from(Product p) {
        int totalStock = p.getVariants().stream().mapToInt(ProductVariant::getStock).sum();

        return ProductDto.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .sku(p.getSku())
                .price(p.getPrice())
                .originalPrice(p.getOriginalPrice())
                .image(p.getImages().stream()
                        .filter(ProductImage::isPrimary)
                        .map(ProductImage::getUrl)
                        .findFirst()
                        .orElse(p.getImageUrl()))
                .category(p.getCategory() != null ? p.getCategory().getName() : null)
                .categorySlug(p.getCategory() != null ? p.getCategory().getSlug() : null)
                .description(p.getDescription())
                .detailedDescription(p.getDetailedDescription())
                .status(p.getStatus().name().toLowerCase())
                .soldCount(p.getSoldCount())
                .avgRating(p.getAvgRating())
                .reviewCount(p.getReviewCount())
                .stock(totalStock)
                .isNew(p.isNew())
                .isBestSeller(p.isBestSeller())
                .variants(p.getVariants().stream().map(v -> VariantDto.builder()
                        .id(v.getId())
                        .size(v.getSize())
                        .color(v.getColor())
                        .colorHex(v.getColorHex())
                        .stock(v.getStock())
                        .sku(v.getSku())
                        .imageUrl(v.getImageUrl())
                        .build()).collect(Collectors.toList()))
                .images(p.getImages().stream()
                        .map(ProductImage::getUrl)
                        .collect(Collectors.toList()))
                .createdAt(p.getCreatedAt())
                .build();
    }
}
