package com.lilifashion.module.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lilifashion.module.ai.controller.ChatController.ChatMessageDto;
import com.lilifashion.module.ai.controller.ChatController.RecommendedProduct;
import com.lilifashion.module.ai.entity.ChatHistory;
import com.lilifashion.module.ai.repository.ChatHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatHistoryRepository chatHistoryRepository;
    private final ObjectMapper objectMapper;

    // ─── Lưu tin nhắn vào DB ─────────────────────────────────────

    @Transactional
    public void saveMessage(String sessionId, Long userId, String role, String content,
                            List<RecommendedProduct> products) {
        try {
            String productsJson = null;
            if (products != null && !products.isEmpty()) {
                productsJson = objectMapper.writeValueAsString(products);
            }

            ChatHistory history = ChatHistory.builder()
                    .sessionId(sessionId)
                    .userId(userId)
                    .role(role)
                    .content(content)
                    .productsJson(productsJson)
                    .build();

            chatHistoryRepository.save(history);
        } catch (Exception e) {
            log.warn("Failed to save chat message to DB: {}", e.getMessage());
        }
    }

    // ─── Lấy lịch sử chat theo session ───────────────────────────

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getHistory(String sessionId) {
        return mapToDto(chatHistoryRepository.findBySessionIdOrderByCreatedAtAsc(sessionId));
    }

    // ─── Lấy lịch sử theo userId (tất cả sessions) ───────────────

    @Transactional(readOnly = true)
    public List<ChatMessageDto> getHistoryByUser(Long userId) {
        return mapToDto(chatHistoryRepository.findByUserIdOrderByCreatedAtAsc(userId));
    }

    // ─── Xóa lịch sử chat theo session ───────────────────────────

    @Transactional
    public void clearHistory(String sessionId) {
        chatHistoryRepository.deleteBySessionId(sessionId);
        log.info("Cleared chat history for session: {}", sessionId);
    }

    // ─── Helper: Convert entity list → DTO list ───────────────────

    private List<ChatMessageDto> mapToDto(List<ChatHistory> records) {
        List<ChatMessageDto> result = new ArrayList<>();
        for (ChatHistory record : records) {
            List<RecommendedProduct> products = null;
            if (record.getProductsJson() != null) {
                try {
                    products = objectMapper.readValue(record.getProductsJson(),
                            new TypeReference<List<RecommendedProduct>>() {});
                } catch (Exception e) {
                    log.warn("Failed to parse products JSON for message {}: {}", record.getId(), e.getMessage());
                }
            }
            result.add(new ChatMessageDto(
                    record.getId().toString(),
                    record.getRole(),
                    record.getContent(),
                    products,
                    record.getCreatedAt().toInstant(java.time.ZoneOffset.UTC).toEpochMilli()
            ));
        }
        return result;
    }
}
