package com.lilifashion.module.order.dto;

import com.lilifashion.module.order.entity.Order;
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
public class OrderDto {
    private Long id;
    private String orderCode;
    private List<ItemDto> items;
    private BigDecimal total;
    private BigDecimal totalAmount;    // alias cho total, FE dùng totalAmount
    private BigDecimal subTotal;       // = total (chưa có phí ship riêng)
    private BigDecimal shippingFee;    // mặc định 0
    private BigDecimal discountAmount; // mặc định 0
    private String status;
    private String shippingAddress;
    private String customerName;
    private String customerPhone;
    private String paymentMethod;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime paymentExpiredAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ItemDto {
        private Long productId;
        private String productName;
        private String productImage;
        private String image;          // alias productImage
        private String size;
        private String color;
        private BigDecimal price;
        private Integer quantity;
    }

    public static OrderDto from(Order order) {
        return OrderDto.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .total(order.getTotal())
                .totalAmount(order.getTotal())          // alias
                .subTotal(order.getTotal())             // chưa tách phí ship
                .shippingFee(BigDecimal.ZERO)
                .discountAmount(BigDecimal.ZERO)
                .status(order.getStatus().name().toLowerCase())
                .shippingAddress(order.getShippingAddress())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .paymentMethod(order.getPaymentMethod())
                .note(order.getNote())
                .createdAt(order.getCreatedAt())
                .paymentExpiredAt(order.getPaymentExpiredAt())
                .items(order.getItems().stream().map(i -> ItemDto.builder()
                        .productId(i.getProductId())
                        .productName(i.getProductName())
                        .productImage(i.getProductImage())
                        .image(i.getProductImage())     // alias
                        .size(i.getSize())
                        .color(i.getColor())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}
