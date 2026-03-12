import React from 'react';

export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-accent to-amber-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">AI</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-[chatBounce_1.4s_ease-in-out_infinite]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-[chatBounce_1.4s_ease-in-out_0.2s_infinite]" />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-[chatBounce_1.4s_ease-in-out_0.4s_infinite]" />
                </div>
            </div>
        </div>
    );
}
