package com.lilifashion.module.product.repository;

import com.lilifashion.module.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findBySlugAndDeletedAtIsNull(String slug);

    boolean existsBySlug(String slug);

    @Query("""
        SELECT p FROM Product p
        LEFT JOIN p.category c
        LEFT JOIN p.variants v
        WHERE p.deletedAt IS NULL
        AND p.status = 'ACTIVE'
        AND (:categorySlug IS NULL OR c.slug = :categorySlug)
        AND (:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:minPrice IS NULL OR p.price >= :minPrice)
        AND (:maxPrice IS NULL OR p.price <= :maxPrice)
        AND (:size IS NULL OR v.size = :size)
        GROUP BY p.id
        """)
    Page<Product> findAllWithFilters(
            @Param("categorySlug") String categorySlug,
            @Param("keyword") String keyword,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("size") String size,
            Pageable pageable
    );

    Page<Product> findByDeletedAtIsNull(Pageable pageable); // Admin: all including drafts

    long countByCategoryId(Long categoryId);
    
    List<Product> findByCategoryId(Long categoryId);

    long countByCategoryIdAndDeletedAtIsNull(Long categoryId);

    // Featured products: isBestSeller = true and active
    Page<Product> findByIsBestSellerTrueAndDeletedAtIsNullAndStatus(Product.ProductStatus status, Pageable pageable);
}
