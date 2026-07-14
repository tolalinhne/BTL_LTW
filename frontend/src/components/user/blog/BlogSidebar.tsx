import React from 'react';
import { Search, BookOpen } from 'lucide-react';
import type { BlogCategory } from '@/types/user.types';

interface BlogSidebarProps {
    categories: BlogCategory[];
    activeCategory: string;
    searchQuery: string;
    onCategoryChange: (slug: string) => void;
    onSearchChange: (query: string) => void;
}

export default function BlogSidebar({
    categories,
    activeCategory,
    searchQuery,
    onCategoryChange,
    onSearchChange,
}: BlogSidebarProps) {
    return (
        <aside className="space-y-8">
            {/* Search by title */}
            <div>
                <h4 className="font-serif text-lg font-bold text-brand-primary mb-3">Tìm kiếm</h4>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm theo tiêu đề bài viết..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>
                {searchQuery && (
                    <p className="mt-1.5 text-xs text-gray-400">
                        Đang tìm: <span className="text-brand-accent font-medium">"{searchQuery}"</span>
                    </p>
                )}
            </div>

            {/* Categories */}
            <div>
                <h4 className="font-serif text-lg font-bold text-brand-primary mb-3">Danh mục</h4>
                <ul className="space-y-1">
                    <li>
                        <button
                            onClick={() => onCategoryChange('')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                activeCategory === ''
                                    ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                            }`}
                        >
                            <BookOpen size={14} className="flex-shrink-0" />
                            Tất cả bài viết
                        </button>
                    </li>
                    {categories.length === 0 ? (
                        // Skeleton khi chưa load xong categories
                        Array.from({ length: 4 }).map((_, i) => (
                            <li key={i}>
                                <div className="animate-pulse h-9 bg-gray-100 rounded-lg mx-1" />
                            </li>
                        ))
                    ) : (
                        categories.map((cat) => (
                            <li key={cat.id}>
                                <button
                                    onClick={() => onCategoryChange(cat.slug)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between group ${
                                        activeCategory === cat.slug
                                            ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                                    }`}
                                >
                                    <span>{cat.name}</span>
                                    {activeCategory === cat.slug && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-brand-accent flex-shrink-0" />
                                    )}
                                </button>
                            </li>
                        ))
                    )}
                </ul>
            </div>
        </aside>
    );
}
