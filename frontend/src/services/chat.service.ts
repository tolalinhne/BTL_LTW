import api from './api';
import type { ChatApiResponse, ChatMessage, ChatProduct } from '@/types/user.types';

// ─── Send a message ───────────────────────────────────────────

export async function sendChatMessage(
    message: string,
    sessionId: string,
    userId?: string | number
): Promise<ChatApiResponse> {
    const res = await api.post('/ai/chat', {
        message,
        sessionId,
        userId: userId ? Number(userId) : null,
    });
    const payload = res.data?.data ?? res.data;
    return {
        reply: payload?.reply ?? '',
        recommendedProducts: payload?.recommendedProducts ?? [],
        references: payload?.references ?? [],
    };
}

// ─── Load chat history for a session ─────────────────────────

interface HistoryRecord {
    id: string;
    role: 'user' | 'bot';
    content: string;
    products?: ChatProduct[];
    timestamp: number;
}

export async function loadChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
        const res = await api.get(`/ai/chat/history/${sessionId}`);
        const records: HistoryRecord[] = res.data?.data ?? [];

        return records.map((r) => ({
            id: r.id,
            role: r.role,
            content: r.content,
            products: r.products && r.products.length > 0 ? r.products : undefined,
            timestamp: r.timestamp,
        }));
    } catch {
        return [];
    }
}

// ─── Clear chat history for a session ────────────────────────

export async function clearChatHistory(sessionId: string): Promise<void> {
    try {
        await api.delete(`/ai/chat/history/${sessionId}`);
    } catch {
        // Non-critical, silently fail
    }
}
