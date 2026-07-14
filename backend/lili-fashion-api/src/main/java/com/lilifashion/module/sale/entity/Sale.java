package com.lilifashion.module.sale.entity;

import com.lilifashion.module.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "discount_percent")
    private BigDecimal discountPercent;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Builder.Default
    @ManyToMany
    @JoinTable(
        name = "sale_products",
        joinColumns = @JoinColumn(name = "sale_id"),
        inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SaleStatus status = SaleStatus.DRAFT;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return status == SaleStatus.ACTIVE
                && (startTime == null || !now.isBefore(startTime))
                && (endTime == null || !now.isAfter(endTime));
    }

    public enum SaleStatus {
        DRAFT, ACTIVE, ENDED
    }
}
