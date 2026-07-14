import React from 'react';

interface QuickRepliesProps {
    onSelect: (text: string) => void;
    disabled?: boolean;
}

const SUGGESTIONS = [
    '👗 Gợi ý outfit đi chơi',
    '📏 Size áo cho 1m65 55kg',
    '🧥 Áo khoác mùa đông',
    '🛒 Sản phẩm bán chạy',
];

export default function QuickReplies({ onSelect, disabled }: QuickRepliesProps) {
    return (
        <div className="flex gap-2 flex-wrap px-4 py-2">
            {SUGGESTIONS.map((text) => (
                <button
                    key={text}
                    onClick={() => onSelect(text)}
                    disabled={disabled}
                    className="text-xs px-3 py-1.5 rounded-full border border-brand-accent/30 text-brand-accent bg-brand-accent/5 hover:bg-brand-accent/15 hover:border-brand-accent/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    {text}
                </button>
            ))}
        </div>
    );
}
