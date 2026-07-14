package com.lilifashion.module.cart.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.cart.entity.Cart;
import com.lilifashion.module.cart.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
@Tag(name = "Cart", description = "Quản lý giỏ hàng")
@SecurityRequirement(name = "Bearer")
public class CartController {

    private final CartService cartService;

    @GetMapping
    @Operation(summary = "Lấy giỏ hàng hiện tại")
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @AuthenticationPrincipal User user) {
        Cart cart = cartService.getCart(user);
        return ResponseEntity.ok(ApiResponse.success(CartResponse.from(cart)));
    }

    @PostMapping("/items")
    @Operation(summary = "Thêm sản phẩm vào giỏ")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @AuthenticationPrincipal User user,
            @RequestBody AddItemRequest request) {
        Cart cart = cartService.addItem(user, request.getProductId(),
                request.getVariantId(), request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success("Đã thêm vào giỏ hàng", CartResponse.from(cart)));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Cập nhật số lượng item (qty=0 để xóa)")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @RequestBody UpdateItemRequest request) {
        Cart cart = cartService.updateItem(user, itemId, request.getQuantity());
        return ResponseEntity.ok(ApiResponse.success(CartResponse.from(cart)));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Xóa item khỏi giỏ")
    public ResponseEntity<ApiResponse<Void>> removeItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId) {
        cartService.removeItem(user, itemId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa khỏi giỏ hàng", null));
    }

    @DeleteMapping
    @Operation(summary = "Xóa toàn bộ giỏ hàng")
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @AuthenticationPrincipal User user) {
        cartService.clearCart(user);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa giỏ hàng", null));
    }

    // ─── Inner DTOs ─────────────────────────────────────────

    @Data
    public static class AddItemRequest {
        private Long productId;
        private Long variantId;
        @Min(1)
        private int quantity = 1;
    }

    @Data
    public static class UpdateItemRequest {
        private int quantity;
    }

    @Data
    public static class CartResponse {
        private Long id;
        private List<CartItemDto> items;
        private BigDecimal total;
        private int itemCount;

        @Data
        public static class CartItemDto {
            private Long id;
            private Long productId;
            private String productName;
            private String productImage;
            private Long variantId;
            private String size;
            private String color;
            private Integer quantity;
            private BigDecimal price;
        }

        public static CartResponse from(Cart cart) {
            CartResponse res = new CartResponse();
            res.setId(cart.getId());
            List<CartItemDto> itemDtos = cart.getItems().stream().map(ci -> {
                CartItemDto dto = new CartItemDto();
                dto.setId(ci.getId());
                dto.setProductId(ci.getProduct().getId());
                dto.setProductName(ci.getProduct().getName());
                dto.setProductImage(ci.getProduct().getImageUrl());
                dto.setVariantId(ci.getVariant() != null ? ci.getVariant().getId() : null);
                dto.setSize(ci.getVariant() != null ? ci.getVariant().getSize() : null);
                dto.setColor(ci.getVariant() != null ? ci.getVariant().getColor() : null);
                dto.setQuantity(ci.getQuantity());
                dto.setPrice(ci.getPriceSnapshot());
                return dto;
            }).collect(Collectors.toList());
            res.setItems(itemDtos);
            res.setItemCount(cart.getItems().size());
            res.setTotal(cart.getItems().stream()
                    .filter(i -> i.getPriceSnapshot() != null)
                    .map(i -> i.getPriceSnapshot().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add));
            return res;
        }
    }
}
