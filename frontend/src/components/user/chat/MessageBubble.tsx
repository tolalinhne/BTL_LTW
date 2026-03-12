import React from 'react';
import type { ChatMessage } from '@/types/user.types';
import ProductCardInChat from './ProductCardInChat';

interface MessageBubbleProps {
    message: ChatMessage;
}

/** Simple markdown: **bold**, *italic*, \n for line breaks, - for list items */
function renderSimpleMarkdown(text: string): React.ReactNode[] {
    const lines = text.split('\n');
    const nodes: React.ReactNode[] = [];

    lines.forEach((line, i) => {
        if (i > 0) nodes.push(<br key={`br-${i}`} />);

        const trimmed = line.trim();

        // List items
        if (trimmed.startsWith('- ') || /^\d+\.\s/.test(trimmed)) {
            const listContent = trimmed.replace(/^[-\d]+\.?\s/, '');
            nodes.push(
                <span key={`li-${i}`} className="flex gap-1.5 items-start">
                    <span className="text-brand-accent mt-0.5">•</span>
                    <span>{parseInline(listContent)}</span>
                </span>
            );
            return;
        }

        nodes.push(<span key={`l-${i}`}>{parseInline(line)}</span>);
    });

    return nodes;
}

function parseInline(text: string): React.ReactNode[] {
    const parts: React.ReactNode[] = [];
    // Match **bold** and *italic*
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
        if (match.index > lastIndex) {
            parts.push(text.slice(lastIndex, match.index));
        }
        if (match[2]) {
            parts.push(<strong key={match.index} className="font-semibold">{match[2]}</strong>);
        } else if (match[3]) {
            parts.push(<em key={match.index} className="italic text-gray-600">{match[3]}</em>);
        }
        lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex));
    }

    return parts.length > 0 ? parts : [text];
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isBot = message.role === 'bot';

    return (
        <div className={`flex gap-2.5 px-4 py-1.5 ${isBot ? 'justify-start' : 'justify-end'}`}>
            {/* Bot avatar */}
            {isBot && (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent to-amber-600 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">AI</span>
                </div>
            )}

            <div className={`max-w-[80%] ${isBot ? '' : 'order-first'}`}>
                {/* Message bubble */}
                <div
                    className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isBot
                            ? 'bg-white border border-gray-100 rounded-bl-sm shadow-sm text-gray-700'
                            : 'bg-brand-primary text-white rounded-br-sm'
                        }`}
                >
                    {renderSimpleMarkdown(message.content)}
                </div>

                {/* Product cards */}
                {isBot && message.products && message.products.length > 0 && (
                    <div className="mt-2 flex flex-col gap-2">
                        {message.products.map((product) => (
                            <ProductCardInChat key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* References */}
                {isBot && message.references && message.references.length > 0 && (
                    <p className="mt-1.5 text-[10px] text-gray-400 italic px-1">
                        📚 {message.references.join(' · ')}
                    </p>
                )}

                {/* Timestamp */}
                <p className={`text-[10px] text-gray-400 mt-1 px-1 ${isBot ? '' : 'text-right'}`}>
                    {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </p>
            </div>
        </div>
    );
}
