package com.lilifashion.module.order.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.dto.PagedResponse;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.order.dto.OrderDto;
import com.lilifashion.module.order.dto.OrderRequest;
import com.lilifashion.module.order.dto.StatusUpdateRequest;
import com.lilifashion.module.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Quản lý đơn hàng")
@SecurityRequirement(name = "Bearer")
public class OrderController {

    private final OrderService orderService;

    // ─── Member ───────────────────────────────────────────────────

    @PostMapping("/api/orders")
    @Operation(summary = "Đặt hàng (checkout từ giỏ hàng)")
    public ResponseEntity<ApiResponse<OrderDto>> checkout(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderRequest request) {
        OrderDto order = orderService.checkout(user, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đặt hàng thành công", order));
    }

    @GetMapping("/api/orders")
    @Operation(summary = "Lịch sử đơn hàng của tôi")
    public ResponseEntity<ApiResponse<PagedResponse<OrderDto>>> getMyOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getMyOrders(user, page, limit)));
    }

    @GetMapping("/api/orders/{id}")
    @Operation(summary = "Chi tiết đơn hàng của tôi")
    public ResponseEntity<ApiResponse<OrderDto>> getMyOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrderById(user, id)));
    }

    @PutMapping("/api/orders/{id}/cancel")
    @Operation(summary = "Hủy đơn hàng (chỉ khi PENDING hoặc CONFIRMED)")
    public ResponseEntity<ApiResponse<OrderDto>> cancelOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Đã hủy đơn hàng",
                orderService.cancelOrder(user, id)));
    }

    // ─── Admin / Staff ────────────────────────────────────────────

    @GetMapping("/api/admin/orders")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or hasAuthority('order.manage')")
    @Operation(summary = "Admin: Tất cả đơn hàng")
    public ResponseEntity<ApiResponse<PagedResponse<OrderDto>>> getAllOrders(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getAllOrders(page, limit)));
    }

    @PutMapping("/api/admin/orders/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF') or hasAuthority('order.manage')")
    @Operation(summary = "Admin/Staff: Cập nhật trạng thái đơn hàng")
    public ResponseEntity<ApiResponse<OrderDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công",
                orderService.updateStatus(id, request)));
    }
}
