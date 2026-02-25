import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="relative">
                <div className="w-12 h-12 border-4 border-brand-accent/20 rounded-full animate-spin border-t-brand-accent"></div>
                <div className="mt-4 text-sm text-gray-500 text-center">Đang tải...</div>
            </div>
        </div>
    );
}
