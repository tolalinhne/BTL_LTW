package com.lilifashion.module.order.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

/**
 * DTO nhận dữ liệu từ SePay Webhook.
 * Ref: https://docs.sepay.vn/tich-hop-webhooks.html#du-lieu
 */
@Data
public class SepayWebhookDto {

    /** ID giao dịch trên SePay */
    private Long id;

    /** Brand name của ngân hàng (ví dụ: Vietcombank, MB) */
    private String gateway;

    /** Thời gian xảy ra giao dịch phía ngân hàng */
    private String transactionDate;

    /** Số tài khoản ngân hàng */
    private String accountNumber;

    /** Mã code thanh toán — SePay tự nhận diện từ nội dung CK (ví dụ: LILI12345) */
    private String code;

    /** Nội dung chuyển khoản đầy đủ */
    private String content;

    /**
     * Loại giao dịch: "in" = tiền vào, "out" = tiền ra
     */
    private String transferType;

    /** Số tiền giao dịch */
    private BigDecimal transferAmount;

    /** Số dư tài khoản (lũy kế) */
    private BigDecimal accumulated;

    /** Tài khoản ảo (VA) nếu có */
    private String subAccount;

    /** Mã tham chiếu của tin nhắn SMS ngân hàng */
    private String referenceCode;

    /** Toàn bộ nội dung tin nhắn SMS */
    private String description;
}
