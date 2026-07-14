import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Trash2, Send, Sparkles, Clock, ChevronRight } from 'lucide-react';
import { useChat } from '@/contexts/ChatContext';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickReplies from './QuickReplies';
import { loadChatHistory } from '@/services/chat.service';
import type { ChatMessage } from '@/types/user.types';

export default function ChatWindow() {
    const { messages, isLoading, sendMessage, closeChat, clearChat, pastSessions, loadSession } = useChat();
    const [input, setInput] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const historyPanelRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    // Focus input on open
    useEffect(() => {
        const t = setTimeout(() => inputRef.current?.focus(), 300);
        return () => clearTimeout(t);
    }, []);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        sendMessage(input);
        setInput('');
    }, [input, isLoading, sendMessage]);

    const handleQuickReply = useCallback((text: string) => {
        sendMessage(text);
    }, [sendMessage]);

    // Close history panel on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (historyPanelRef.current && !historyPanelRef.current.contains(e.target as Node)) {
                setShowHistory(false);
            }
        };
        if (showHistory) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showHistory]);

    const showQuickReplies = messages.length <= 2 && !isLoading;

    return (
        <div className="flex flex-col h-full bg-gray-50/80 backdrop-blur-sm">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-accent to-amber-600 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-brand-primary font-sans">
                            AI Fashion Assistant
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                            <span className="text-[10px] text-gray-400">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1" ref={historyPanelRef}>
                    {/* History button */}
                    <div className="relative">
                        <button
                            onClick={() => setShowHistory(v => !v)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                showHistory ? 'text-brand-accent bg-amber-50' : 'text-gray-400 hover:text-brand-accent hover:bg-amber-50'
                            }`}
                            title="Lịch sử chat"
                        >
                            <Clock size={15} />
                        </button>

                        {/* History dropdown */}
                        {showHistory && (
                            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lịch sử hội thoại</p>
                                </div>
                                {pastSessions.length === 0 ? (
                                    <div className="px-4 py-6 text-center">
                                        <Clock size={24} className="mx-auto text-gray-300 mb-2" />
                                        <p className="text-xs text-gray-400">Chưa có lịch sử nào</p>
                                    </div>
                                ) : (
                                    <ul className="max-h-64 overflow-y-auto">
                                        {pastSessions.map((session) => (
                                            <li key={session.sessionId}>
                                                <button
                                                    onClick={() => { loadSession(session.sessionId); setShowHistory(false); }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                                                >
                                                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                                        <Clock size={13} className="text-brand-accent" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-brand-primary font-medium truncate">
                                                            {session.firstMessage}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                                            {session.messageCount} tin nhắn · {session.date}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-brand-accent transition-colors flex-shrink-0" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={clearChat}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-50 transition-colors"
                        title="Chat mới"
                    >
                        <Trash2 size={15} />
                    </button>
                    <button
                        onClick={closeChat}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* ─── Messages ─── */}
            <div className="flex-1 overflow-y-auto py-3 no-scrollbar">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
            </div>

            {/* ─── Quick Replies ─── */}
            {showQuickReplies && (
                <QuickReplies onSelect={handleQuickReply} disabled={isLoading} />
            )}

            {/* ─── Input ─── */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 bg-white border-t border-gray-100 flex-shrink-0">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Nhập tin nhắn..."
                    disabled={isLoading}
                    className="flex-1 bg-gray-50 text-sm text-brand-primary rounded-xl px-4 py-2.5 border border-gray-200 focus:border-brand-accent focus:outline-none focus:ring-1 focus:ring-brand-accent/20 placeholder:text-gray-400 disabled:opacity-50 transition-colors"
                />
                <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="w-10 h-10 rounded-xl bg-brand-accent text-white flex items-center justify-center hover:bg-brand-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 flex-shrink-0"
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
