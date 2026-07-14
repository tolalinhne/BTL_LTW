package com.lilifashion.module.admin;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.module.auth.repository.UserRepository;
import com.lilifashion.module.order.repository.OrderRepository;
import com.lilifashion.module.product.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor
@Tag(name = "Admin Dashboard", description = "Dashboard metrics")
@SecurityRequirement(name = "Bearer")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class DashboardController {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @GetMapping("/metrics")
    @Operation(summary = "Admin: Lấy metrics tổng quan cho dashboard")
    public ResponseEntity<ApiResponse<DashboardMetrics>> getMetrics() {
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.count();

        // Calculate total revenue from all orders
        BigDecimal totalRevenue = BigDecimal.ZERO;
        try {
            var orders = orderRepository.findAll();
            totalRevenue = orders.stream()
                    .map(o -> o.getTotal() != null ? o.getTotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception ignored) {}

        DashboardMetrics metrics = DashboardMetrics.builder()
                .totalRevenue(totalRevenue.doubleValue())
                .revenueChange(0)
                .totalOrders(totalOrders)
                .ordersChange(0)
                .totalProducts(totalProducts)
                .productsChange(0)
                .totalCustomers(totalCustomers)
                .customersChange(0)
                .build();

        return ResponseEntity.ok(ApiResponse.success(metrics));
    }

    @Data
    @Builder
    public static class DashboardMetrics {
        private double totalRevenue;
        private double revenueChange;
        private long totalOrders;
        private double ordersChange;
        private long totalProducts;
        private double productsChange;
        private long totalCustomers;
        private double customersChange;
    }
}
