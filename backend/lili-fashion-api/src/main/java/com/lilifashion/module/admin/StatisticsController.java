package com.lilifashion.module.admin;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.module.order.repository.OrderRepository;
import com.lilifashion.module.auth.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Year;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/statistics")
@RequiredArgsConstructor
@Tag(name = "Admin Statistics", description = "Thống kê kinh doanh theo năm")
@SecurityRequirement(name = "Bearer")
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {

    private final OrderRepository orderRepository;
    private final UserRepository  userRepository;

    @GetMapping
    @Operation(summary = "Admin: Lấy thống kê kinh doanh theo năm")
    public ResponseEntity<ApiResponse<StatisticsResponse>> getStatistics(
            @RequestParam(defaultValue = "#{T(java.time.Year).now().getValue()}") int year) {

        // ── Yearly stats ────────────────────────────────────────────────────
        BigDecimal revenue       = nullSafe(orderRepository.findTotalRevenueByYear(year));
        long       totalOrders   = orderRepository.countOrdersByYear(year);
        long       delivered     = orderRepository.countDeliveredOrdersByYear(year);
        BigDecimal avgOrder      = nullSafe(orderRepository.findAvgOrderValueByYear(year));
        long       customers     = orderRepository.countDistinctCustomersByYear(year);

        // YoY change vs previous year
        int prevYear = year - 1;
        BigDecimal prevRevenue   = nullSafe(orderRepository.findTotalRevenueByYear(prevYear));
        long       prevOrders    = orderRepository.countOrdersByYear(prevYear);
        BigDecimal prevAvg       = nullSafe(orderRepository.findAvgOrderValueByYear(prevYear));
        long       prevCustomers = orderRepository.countDistinctCustomersByYear(prevYear);

        YearlyStats yearlyStats = YearlyStats.builder()
                .revenue(revenue.longValue())
                .orders(totalOrders)
                .deliveredOrders(delivered)
                .customers(customers)
                .avgOrder(avgOrder.longValue())
                .revenueChange(pctChange(prevRevenue, revenue))
                .orderChange(pctChange(prevOrders, totalOrders))
                .customerChange(pctChange(prevCustomers, customers))
                .avgChange(pctChange(prevAvg, avgOrder))
                .build();

        // ── Monthly data ─────────────────────────────────────────────────────
        List<Object[]> rows = orderRepository.findMonthlyRevenueByYear(year);
        List<MonthlyData> monthlyData = new ArrayList<>();
        for (Object[] row : rows) {
            int    month   = ((Number) row[0]).intValue();
            long   rev     = ((Number) row[1]).longValue();
            long   orders  = ((Number) row[2]).longValue();
            monthlyData.add(MonthlyData.builder()
                    .month("T" + month)
                    .revenue(rev)
                    .orders(orders)
                    .build());
        }

        // ── Top products (5) ─────────────────────────────────────────────────
        List<Object[]> topRows = orderRepository.findTopProductsByYear(year, PageRequest.of(0, 5));
        List<TopProduct> topProducts = new ArrayList<>();
        for (Object[] row : topRows) {
            topProducts.add(TopProduct.builder()
                    .productId(((Number) row[0]).longValue())
                    .name((String) row[1])
                    .sold(((Number) row[2]).intValue())
                    .revenue(((Number) row[3]).longValue())
                    .build());
        }

        StatisticsResponse response = StatisticsResponse.builder()
                .year(year)
                .yearlyStats(yearlyStats)
                .monthlyData(monthlyData)
                .topProducts(topProducts)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private BigDecimal nullSafe(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private double pctChange(BigDecimal prev, BigDecimal curr) {
        if (prev == null || prev.compareTo(BigDecimal.ZERO) == 0) return 0.0;
        return curr.subtract(prev)
                   .divide(prev, 4, RoundingMode.HALF_UP)
                   .multiply(BigDecimal.valueOf(100))
                   .doubleValue();
    }

    private double pctChange(long prev, long curr) {
        if (prev == 0) return 0.0;
        return Math.round(((double)(curr - prev) / prev) * 1000.0) / 10.0;
    }

    // ── Inner DTOs ───────────────────────────────────────────────────────────

    @Data @Builder
    public static class StatisticsResponse {
        private int year;
        private YearlyStats yearlyStats;
        private List<MonthlyData> monthlyData;
        private List<TopProduct> topProducts;
    }

    @Data @Builder
    public static class YearlyStats {
        private long   revenue;
        private long   orders;
        private long   deliveredOrders;
        private long   customers;
        private long   avgOrder;
        private double revenueChange;
        private double orderChange;
        private double customerChange;
        private double avgChange;
    }

    @Data @Builder
    public static class MonthlyData {
        private String month;
        private long   revenue;
        private long   orders;
    }

    @Data @Builder
    public static class TopProduct {
        private long   productId;
        private String name;
        private int    sold;
        private long   revenue;
    }
}
