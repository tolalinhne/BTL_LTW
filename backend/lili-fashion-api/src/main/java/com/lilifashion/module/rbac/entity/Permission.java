package com.lilifashion.module.rbac.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "permissions")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "`key`", nullable = false, unique = true)
    private String key; // e.g. "product.create", "order.manage"

    @Column(nullable = false)
    private String label; // e.g. "Tạo sản phẩm"

    private String description;

    @Column(name = "is_danger")
    @Builder.Default
    private boolean danger = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
