package com.lilifashion.module.order.controller;

import com.lilifashion.module.order.dto.SepayWebhookDto;
import com.lilifashion.module.order.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Nhận webhook từ SePay khi có giao dịch chuyển khoản thành công.
 * Endpoint này là PUBLIC (không cần JWT) nhưng được bảo vệ bằng SePay API Key.
 *
 * Cấu hình tại SePay dashboard:
 *   - URL: https://api.tolalinhne.site/api/webhook/sepay
 *   - Kiểu chứng thực: API Key
 *   - Header: Authorization: Apikey <sepay.api-key>
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Payment Webhook", description = "SePay payment webhook receiver")
public class SepayWebhookController {

    private final OrderService orderService;

    @Value("${sepay.api-key}")
    private String sepayApiKey;

    @PostMapping("/api/webhook/sepay")
    @Operation(summary = "SePay Webhook - Nhận thông báo giao dịch chuyển khoản")
    public ResponseEntity<Map<String, Object>> handleSepayWebhook(
            @RequestBody SepayWebhookDto payload,
            HttpServletRequest request) {

        // ── 1. Xác thực API Key từ SePay ────────────────────────────────
        String authHeader = request.getHeader("Authorization");
        String expectedAuth = "Apikey " + sepayApiKey;

        if (authHeader == null || !authHeader.equals(expectedAuth)) {
            log.warn("[SePay] Webhook bị từ chối: Authorization header không hợp lệ. IP={}",
                    request.getRemoteAddr());
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }

        log.info("[SePay] Nhận webhook: id={}, transferType={}, code={}, amount={}",
                payload.getId(), payload.getTransferType(), payload.getCode(), payload.getTransferAmount());

        // ── 2. Chỉ xử lý giao dịch tiền VÀO ─────────────────────────────
        if (!"in".equalsIgnoreCase(payload.getTransferType())) {
            log.info("[SePay] Bỏ qua giao dịch tiền ra (id={})", payload.getId());
            return ResponseEntity.ok(Map.of("success", true, "message", "Ignored outbound transaction"));
        }

        // ── 3. Kiểm tra code thanh toán có tồn tại không ─────────────────
        String orderCode = payload.getCode();
        if (orderCode == null || orderCode.isBlank()) {
            // Không có orderCode → thử tìm trong content (nội dung CK)
            orderCode = extractOrderCodeFromContent(payload.getContent());
        }

        if (orderCode == null) {
            log.info("[SePay] Không tìm thấy mã đơn hàng trong giao dịch id={}", payload.getId());
            return ResponseEntity.ok(Map.of("success", true, "message", "No order code found"));
        }

        // ── 4. Xác nhận thanh toán và cập nhật đơn hàng ──────────────────
        boolean confirmed = orderService.confirmPaymentByOrderCode(orderCode, payload.getTransferAmount());

        if (confirmed) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Order confirmed"));
        } else {
            log.warn("[SePay] Không thể xác nhận đơn hàng {}: amount mismatch hoặc không tìm thấy.", orderCode);
            // Vẫn trả 200 để SePay không retry vô hạn
            return ResponseEntity.ok(Map.of("success", true, "message", "Order not found or amount mismatch"));
        }
    }

    /**
     * Tìm orderCode (dạng LILIxxxxx) trong nội dung chuyển khoản.
     */
    private String extractOrderCodeFromContent(String content) {
        if (content == null || content.isBlank()) return null;
        String upper = content.toUpperCase();
        int idx = upper.indexOf("LILI");
        if (idx < 0) return null;
        // Lấy chuỗi từ "LILI" đến ký tự space hoặc hết chuỗi
        int end = idx + 4;
        while (end < upper.length() && Character.isDigit(upper.charAt(end))) {
            end++;
        }
        String code = content.substring(idx, end);
        return code.length() > 4 ? code : null;
    }
}
