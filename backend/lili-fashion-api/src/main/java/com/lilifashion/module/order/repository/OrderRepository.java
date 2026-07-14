package com.lilifashion.module.order.repository;

import com.lilifashion.module.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);
    Page<Order> findAll(Pageable pageable);

    Optional<Order> findByOrderCode(String orderCode);

    List<Order> findByStatusAndPaymentMethodAndPaymentExpiredAtBefore(
            Order.OrderStatus status, String paymentMethod, LocalDateTime now);

    @Query("""
        SELECT COUNT(oi) > 0 FROM OrderItem oi
        WHERE oi.productId = :productId
        AND oi.order.user.id = :userId
        AND oi.order.status = 'DELIVERED'
        """)
    boolean hasUserPurchasedProduct(@Param("userId") Long userId, @Param("productId") Long productId);

    // ── Statistics queries ──────────────────────────────────────────────────

    /** Doanh thu và số đơn theo từng tháng trong năm (chỉ đơn DELIVERED) */
    @Query("""
        SELECT MONTH(o.createdAt) AS month,
               SUM(o.total)       AS revenue,
               COUNT(o.id)        AS orders
        FROM Order o
        WHERE YEAR(o.createdAt) = :year
          AND o.status = com.lilifashion.module.order.entity.Order$OrderStatus.DELIVERED
        GROUP BY MONTH(o.createdAt)
        ORDER BY MONTH(o.createdAt)
        """)
    List<Object[]> findMonthlyRevenueByYear(@Param("year") int year);

    /** Tổng doanh thu của năm (chỉ đơn DELIVERED) */
    @Query("""
        SELECT COALESCE(SUM(o.total), 0)
        FROM Order o
        WHERE YEAR(o.createdAt) = :year
          AND o.status = com.lilifashion.module.order.entity.Order$OrderStatus.DELIVERED
        """)
    BigDecimal findTotalRevenueByYear(@Param("year") int year);

    /** Tổng số đơn hàng của năm */
    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE YEAR(o.createdAt) = :year
        """)
    long countOrdersByYear(@Param("year") int year);

    /** Tổng số đơn DELIVERED của năm */
    @Query("""
        SELECT COUNT(o)
        FROM Order o
        WHERE YEAR(o.createdAt) = :year
          AND o.status = com.lilifashion.module.order.entity.Order$OrderStatus.DELIVERED
        """)
    long countDeliveredOrdersByYear(@Param("year") int year);

    /** Giá trị trung bình/đơn của năm (chỉ đơn DELIVERED) */
    @Query("""
        SELECT COALESCE(AVG(o.total), 0)
        FROM Order o
        WHERE YEAR(o.createdAt) = :year
          AND o.status = com.lilifashion.module.order.entity.Order$OrderStatus.DELIVERED
        """)
    BigDecimal findAvgOrderValueByYear(@Param("year") int year);

    /** Số khách hàng có tối thiểu 1 đơn trong năm */
    @Query("""
        SELECT COUNT(DISTINCT o.user.id)
        FROM Order o
        WHERE YEAR(o.createdAt) = :year
        """)
    long countDistinctCustomersByYear(@Param("year") int year);

    /** Top N sản phẩm bán chạy theo doanh thu (đơn DELIVERED) */
    @Query("""
        SELECT oi.productId,
               oi.productName,
               SUM(oi.quantity)             AS sold,
               SUM(oi.price * oi.quantity)  AS revenue
        FROM OrderItem oi
        WHERE oi.order.status = com.lilifashion.module.order.entity.Order$OrderStatus.DELIVERED
          AND YEAR(oi.order.createdAt) = :year
        GROUP BY oi.productId, oi.productName
        ORDER BY revenue DESC
        """)
    List<Object[]> findTopProductsByYear(@Param("year") int year, Pageable pageable);
}

