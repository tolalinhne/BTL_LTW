package com.lilifashion.module.ai.repository;

import com.lilifashion.module.ai.entity.ChatHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatHistoryRepository extends JpaRepository<ChatHistory, Long> {

    /** Lấy toàn bộ lịch sử của 1 session, theo thứ tự thời gian */
    List<ChatHistory> findBySessionIdOrderByCreatedAtAsc(String sessionId);

    /** Lấy lịch sử của 1 user (tất cả sessions), có thể dùng cho admin */
    List<ChatHistory> findByUserIdOrderByCreatedAtAsc(Long userId);

    /** Xóa toàn bộ lịch sử của 1 session */
    @Modifying
    @Query("DELETE FROM ChatHistory c WHERE c.sessionId = :sessionId")
    void deleteBySessionId(String sessionId);

    /** Đếm số tin nhắn trong session */
    long countBySessionId(String sessionId);
}
