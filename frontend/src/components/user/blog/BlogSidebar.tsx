import React from 'react';
import { Search } from 'lucide-react';
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
            {/* Search */}
            <div>
                <h4 className="font-serif text-lg font-bold text-brand-primary mb-3">Tìm kiếm</h4>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Tìm bài viết..."
                        className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                    />
                </div>
            </div>

            {/* Categories */}
            <div>
                <h4 className="font-serif text-lg font-bold text-brand-primary mb-3">Danh mục</h4>
                <ul className="space-y-1">
                    <li>
                        <button
                            onClick={() => onCategoryChange('')}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === ''
                                    ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                                }`}
                        >
                            Tất cả
                        </button>
                    </li>
                    {categories.map((cat) => (
                        <li key={cat.id}>
                            <button
                                onClick={() => onCategoryChange(cat.slug)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${activeCategory === cat.slug
                                        ? 'bg-brand-accent/10 text-brand-accent font-semibold'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-brand-primary'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Tags cloud */}
            <div>
                <h4 className="font-serif text-lg font-bold text-brand-primary mb-3">Tags phổ biến</h4>
                <div className="flex flex-wrap gap-2">
                    {['xu hướng', 'phối đồ', 'công sở', 'BST mới', 'mẹo', 'hậu trường', 'phối màu'].map((tag) => (
                        <span
                            key={tag}
                            className="inline-block px-3 py-1 bg-gray-50 text-gray-600 text-xs rounded-full border border-gray-200 hover:bg-brand-accent/10 hover:text-brand-accent hover:border-brand-accent/30 transition-all cursor-pointer"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>
            </div>
        </aside>
    );
}
