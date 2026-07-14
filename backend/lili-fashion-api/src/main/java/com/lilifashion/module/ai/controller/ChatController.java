package com.lilifashion.module.ai.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.module.ai.service.ChatHistoryService;
import com.lilifashion.module.ai.service.RagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "AI Chatbot", description = "Chatbot RAG tư vấn thời trang")
public class ChatController {

    private final RagService ragService;
    private final ChatHistoryService chatHistoryService;

    // ─── Send message ────────────────────────────────────────────

    @PostMapping("/api/ai/chat")
    @Operation(summary = "Gửi câu hỏi cho chatbot (public)")
    public ResponseEntity<ApiResponse<ChatResponse>> chat(
            @Valid @RequestBody ChatRequest request) {

        ChatResponse response = ragService.chat(request.getMessage(), request.getSessionId());

        // Persist cả user message và bot reply vào DB
        chatHistoryService.saveMessage(
                response.getSessionId(), request.getUserId(), "user",
                request.getMessage(), null);
        chatHistoryService.saveMessage(
                response.getSessionId(), request.getUserId(), "bot",
                response.getReply(), response.getRecommendedProducts());

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ─── Get history ─────────────────────────────────────────────

    @GetMapping("/api/ai/chat/history/{sessionId}")
    @Operation(summary = "Lấy lịch sử chat theo session")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getHistory(
            @PathVariable String sessionId) {
        List<ChatMessageDto> history = chatHistoryService.getHistory(sessionId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    // ─── Get history by userId (tất cả sessions của 1 user) ──────

    @GetMapping("/api/ai/chat/history/user/{userId}")
    @Operation(summary = "Lấy toàn bộ lịch sử chat của một user (tất cả sessions)")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getHistoryByUser(
            @PathVariable Long userId) {
        List<ChatMessageDto> history = chatHistoryService.getHistoryByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @DeleteMapping("/api/ai/chat/history/{sessionId}")
    @Operation(summary = "Xóa lịch sử chat của session")
    public ResponseEntity<ApiResponse<String>> clearHistory(
            @PathVariable String sessionId) {
        chatHistoryService.clearHistory(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa lịch sử chat."));
    }

    // ─── Admin: Upload knowledge ──────────────────────────────────

    @PostMapping("/api/admin/ai/knowledge")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Upload tài liệu tri thức cho chatbot",
               security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<String>> uploadKnowledge(
            @RequestParam("content") String content,
            @RequestParam("title") String title,
            @RequestParam(value = "type", defaultValue = "FAQ") String type) {
        ragService.uploadKnowledge(title, content, type);
        return ResponseEntity.ok(ApiResponse.success(
                "Đã upload tài liệu '" + title + "'. Đang xử lý embedding (async)..."));
    }

    // ─── Inner DTOs ──────────────────────────────────────────────

    @Data
    public static class ChatRequest {
        @NotBlank(message = "Câu hỏi không được để trống")
        private String message;
        private String sessionId;
        private Long userId; // null nếu khách vãng lai
    }

    @Data
    public static class ChatResponse {
        private String reply;
        private String sessionId;
        private List<RecommendedProduct> recommendedProducts = new ArrayList<>();
        private List<String> references = new ArrayList<>();
    }

    @Data
    public static class RecommendedProduct {
        private Long id;
        private String name;
        private String slug;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private String imageUrl;
        private String categoryName;
    }

    /** DTO trả về khi lấy lịch sử chat */
    public record ChatMessageDto(
            String id,
            String role,
            String content,
            List<RecommendedProduct> products,
            long timestamp
    ) {}
}
