package com.lilifashion.module.sale.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SaleRequest {
    private String name;
    private BigDecimal discountPercent;
    private String couponCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status; // draft, active, ended
    private List<Long> productIds;
}
