package com.lilifashion.module.sale.dto;

import com.lilifashion.module.sale.entity.Sale;
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
public class SaleDto {
    private Long id;
    private String name;
    private BigDecimal discountPercent;
    private String couponCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String status;
    private boolean active;
    private List<Long> productIds;
    private LocalDateTime createdAt;

    public static SaleDto from(Sale s) {
        return SaleDto.builder()
                .id(s.getId())
                .name(s.getName())
                .discountPercent(s.getDiscountPercent())
                .couponCode(s.getCouponCode())
                .startTime(s.getStartTime())
                .endTime(s.getEndTime())
                .status(s.getStatus().name().toLowerCase())
                .active(s.isActive())
                .productIds(s.getProducts().stream().map(p -> p.getId()).collect(Collectors.toList()))
                .createdAt(s.getCreatedAt())
                .build();
    }
}
