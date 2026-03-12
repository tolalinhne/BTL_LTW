import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/user.types';
import { sendChatMessage } from '@/services/chat.service';
import { useAuth } from './AuthContext';

interface ChatContextValue {
    messages: ChatMessage[];
    isOpen: boolean;
    isLoading: boolean;
    toggleChat: () => void;
    openChat: () => void;
    closeChat: () => void;
    sendMessage: (content: string) => Promise<void>;
    clearChat: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const STORAGE_KEY = 'lili_chat_history';
const SESSION_KEY = 'lili_chat_session';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getSessionId(): string {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
        sid = generateId();
        localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
}

function loadMessages(): ChatMessage[] {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveMessages(messages: ChatMessage[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch { /* quota exceeded — silently fail */ }
}

const WELCOME_MESSAGE: ChatMessage = {
    id: 'welcome',
    role: 'bot',
    content: 'Xin chào! 👋 Mình là **AI Fashion Assistant** của LiLi Fashion.\n\nMình có thể giúp bạn tìm sản phẩm, tư vấn size và phối đồ. Hãy hỏi mình bất cứ điều gì nhé! ✨',
    timestamp: Date.now(),
};

export function ChatProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>(() => {
        const saved = loadMessages();
        return saved.length > 0 ? saved : [WELCOME_MESSAGE];
    });
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const sessionId = useRef(getSessionId());

    // Persist messages
    useEffect(() => {
        saveMessages(messages);
    }, [messages]);

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

        setMessages((prev) => [...prev, userMsg]);
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
        setMessages([WELCOME_MESSAGE]);
        localStorage.removeItem(STORAGE_KEY);
        const newSid = generateId();
        sessionId.current = newSid;
        localStorage.setItem(SESSION_KEY, newSid);
    }, []);

    return (
        <ChatContext.Provider value={{
            messages, isOpen, isLoading,
            toggleChat, openChat, closeChat,
            sendMessage, clearChat,
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
