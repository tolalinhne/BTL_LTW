import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/user.types';
import { sendChatMessage, loadChatHistory } from '@/services/chat.service';
import { useAuth } from './AuthContext';

// ── Session summary shown in history dropdown ─────────────────
export interface PastSession {
    sessionId: string;
    firstMessage: string;
    messageCount: number;
    date: string;
}

interface ChatContextValue {
    messages: ChatMessage[];
    isOpen: boolean;
    isLoading: boolean;
    pastSessions: PastSession[];
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
    sendMessage: (content: string) => Promise<void>;
    clearChat: () => void;
    loadSession: (sessionId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const SESSION_KEY = 'lili_chat_session';
const SESSIONS_KEY = 'lili_past_sessions'; // list of past session IDs

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getOrCreateSessionId(): string {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
        sid = generateId();
        localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
}

function savePastSessionId(sid: string) {
    try {
        const existing: string[] = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
        if (!existing.includes(sid)) {
            existing.unshift(sid); // newest first
            // Keep max 20 sessions
            localStorage.setItem(SESSIONS_KEY, JSON.stringify(existing.slice(0, 20)));
        }
    } catch { /* ignore */ }
}

function getPastSessionIds(): string[] {
    try {
        return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    } catch { return []; }
}

function formatDate(timestamp: number): string {
    const d = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

const WELCOME_MESSAGE: ChatMessage = {
    id: 'welcome',
    role: 'bot',
    content: 'Xin chào! 👋 Mình là **AI Fashion Assistant** của LiLi Fashion.\n\nMình có thể giúp bạn tìm sản phẩm, tư vấn size và phối đồ. Hãy hỏi mình bất cứ điều gì nhé! ✨',
    timestamp: Date.now(),
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pastSessions, setPastSessions] = useState<PastSession[]>([]);
    const sessionId = useRef(getOrCreateSessionId());

    // ── Load lịch sử session hiện tại từ DB khi mount ────────────
    useEffect(() => {
        async function init() {
            const currentSid = sessionId.current;
            savePastSessionId(currentSid);

            const history = await loadChatHistory(currentSid);
            if (history.length > 0) {
                setMessages(history);
            }

            // Build past sessions summary (skip current session)
            await refreshPastSessions(currentSid);
        }
        init();
    }, []);

    const refreshPastSessions = useCallback((currentSid: string) => {
        // Read session metadata from localStorage — no API calls needed
        const allIds = getPastSessionIds().filter(id => id !== currentSid);
        const summaries: PastSession[] = allIds
            .map(sid => {
                try {
                    const meta = JSON.parse(localStorage.getItem(`lili_session_meta_${sid}`) || 'null');
                    return meta as PastSession | null;
                } catch { return null; }
            })
            .filter((s): s is PastSession => s !== null);
        setPastSessions(summaries);
    }, []);

    // ── Load một session cũ vào view ─────────────────────────────
    const loadSession = useCallback(async (sid: string) => {
        const history = await loadChatHistory(sid);
        if (history.length > 0) {
            // Switch active session to the loaded one (read-only view)
            sessionId.current = sid;
            localStorage.setItem(SESSION_KEY, sid);
            setMessages(history);
            await refreshPastSessions(sid);
        }
    }, [refreshPastSessions]);

    const toggleChat = useCallback(() => setIsOpen((v) => !v), []);
    const openChat = useCallback(() => setIsOpen(true), []);
    const closeChat = useCallback(() => setIsOpen(false), []);

    const sendMessage = useCallback(async (content: string) => {
        const trimmed = content.trim();
        if (!trimmed || isLoading) return;

        const userMsg: ChatMessage = {
            id: generateId(),
            role: 'user',
            content: trimmed,
            timestamp: Date.now(),
        };

        setMessages((prev) => {
            // Save session metadata on first user message
            if (!prev.some(m => m.role === 'user')) {
                const meta: PastSession = {
                    sessionId: sessionId.current,
                    firstMessage: trimmed.slice(0, 50),
                    messageCount: 2, // user + bot
                    date: formatDate(Date.now()),
                };
                localStorage.setItem(`lili_session_meta_${sessionId.current}`, JSON.stringify(meta));
            }
            return [...prev, userMsg];
        });
        setIsLoading(true);

        try {
            const response = await sendChatMessage(
                trimmed,
                sessionId.current,
                user?.id
            );

            const botMsg: ChatMessage = {
                id: generateId(),
                role: 'bot',
                content: response.reply,
                products: response.recommendedProducts.length > 0 ? response.recommendedProducts : undefined,
                references: response.references,
                timestamp: Date.now(),
            };

            setMessages((prev) => [...prev, botMsg]);
        } catch {
            const errorMsg: ChatMessage = {
                id: generateId(),
                role: 'bot',
                content: 'Xin lỗi, mình đang gặp sự cố kỹ thuật 😔 Vui lòng thử lại sau nhé!',
                timestamp: Date.now(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, user?.id]);

    const clearChat = useCallback(() => {
        const oldSid = sessionId.current;

        // Tạo session mới — lịch sử cũ vẫn lưu trong DB
        const newSid = generateId();
        sessionId.current = newSid;
        localStorage.setItem(SESSION_KEY, newSid);
        savePastSessionId(newSid);

        // Reset UI
        setMessages([WELCOME_MESSAGE]);

        // Refresh danh sách dùng metadata từ localStorage
        refreshPastSessions(newSid);
    }, [refreshPastSessions]);

    return (
        <ChatContext.Provider value={{
            messages, isOpen, isLoading, pastSessions,
            toggleChat, openChat, closeChat,
            sendMessage, clearChat, loadSession,
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat(): ChatContextValue {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error('useChat must be used within a ChatProvider');
    return ctx;
}
