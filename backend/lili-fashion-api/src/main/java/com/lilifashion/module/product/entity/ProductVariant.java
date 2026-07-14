package com.lilifashion.module.product.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "product_variants")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String size; // S, M, L, XL, 2XL

    @Column(nullable = false)
    private String color;

    @Column(name = "color_hex")
    private String colorHex; // e.g. "#FF0000"

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;

    private String sku;

    @Column(name = "image_url")
    private String imageUrl; // optional per-variant image
}
