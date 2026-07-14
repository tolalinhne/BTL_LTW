package com.lilifashion.module.ai.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_histories", indexes = {
    @Index(name = "idx_chat_session", columnList = "session_id"),
    @Index(name = "idx_chat_user", columnList = "user_id")
})
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id", nullable = false, length = 100)
    private String sessionId;

    /** null nếu khách vãng lai (chưa đăng nhập) */
    @Column(name = "user_id")
    private Long userId;

    /** "user" hoặc "bot" */
    @Column(nullable = false, length = 10)
    private String role;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * JSON array các sản phẩm gợi ý, chỉ có ở bot messages.
     * Ví dụ: [{"id":5,"name":"Váy mini","slug":"vay-mini","price":350000,...}]
     */
    @Column(name = "products_json", columnDefinition = "TEXT")
    private String productsJson;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
