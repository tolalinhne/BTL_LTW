package com.lilifashion.module.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OrderRequest {
    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    private String shippingAddress;
    private String customerName;
    private String customerPhone;
    private String paymentMethod; // COD (default)
    private String note;
}
