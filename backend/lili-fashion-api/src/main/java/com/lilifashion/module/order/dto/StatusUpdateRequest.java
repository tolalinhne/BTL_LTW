package com.lilifashion.module.order.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class StatusUpdateRequest {
    @NotBlank(message = "Trạng thái không được để trống")
    private String status; // CONFIRMED, SHIPPING, DELIVERED, CANCELLED
}
