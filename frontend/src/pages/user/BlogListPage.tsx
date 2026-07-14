import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen } from 'lucide-react';
import BlogCard, { BlogCardSkeleton } from '@/components/user/blog/BlogCard';
import BlogSidebar from '@/components/user/blog/BlogSidebar';
import { getBlogs, getCategories } from '@/services/blog.service';
import type { UserBlogPost, BlogCategory } from '@/types/user.types';

export default function BlogListPage() {
    const [searchInput, setSearchInput] = useState(''); // giá trị input thực tế
    const [search, setSearch] = useState('');            // giá trị debounced gửi API
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const limit = 6;

    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [posts, setPosts] = useState<UserBlogPost[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    // Debounce: chờ 400ms sau khi người dùng ngừng gõ mới gọi API
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearch(searchInput);
            setPage(1);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        setLoading(true);
        getBlogs({ page, limit, search, category }).then(({ data, total: t }) => {
            setPosts(data);
            setTotal(t);
            setLoading(false);
        });
    }, [page, search, category]);

    const totalPages = Math.ceil(total / limit);

    // Thay đổi search input (debounced sẽ tự kích hoạt)
    const handleSearchChange = useCallback((q: string) => {
        setSearchInput(q);
    }, []);

    const handleCategoryChange = useCallback((slug: string) => {
        setCategory(slug);
        setPage(1);
    }, []);

    return (
        <div>
            {/* Hero */}
            <section className="relative bg-gradient-to-br from-[#fdfcfb] via-[#f9f5f0] to-[#f0ebe3] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-xs font-semibold mb-4">
                        <BookOpen size={14} /> Fashion Blog
                    </div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-primary mb-4">
                        LiLi <span className="text-brand-accent">Fashion Blog</span>
                    </h1>
                    <p className="text-gray-600 max-w-lg mx-auto">
                        Cập nhật xu hướng, mẹo phối đồ và câu chuyện thời trang mới nhất từ đội ngũ LiLi.
                    </p>
                </div>
            </section>

            {/* Content */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-10">
                    {/* Main */}
                    <div>
                        {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="animate-pulse rounded-2xl overflow-hidden bg-white border border-gray-100">
                                    <div className="aspect-[16/9] bg-gray-200" />
                                    <div className="p-5 space-y-3">
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-200 rounded w-full" />
                                        <div className="h-3 bg-gray-200 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : posts.length === 0 ? (
                            <div className="text-center py-20">
                                <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                                <h3 className="font-serif text-xl font-bold text-gray-400 mb-2">
                                    Không tìm thấy bài viết
                                </h3>
                                <p className="text-sm text-gray-400">
                                    Thử thay đổi từ khóa hoặc danh mục khác nhé.
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    {posts.map((post) => (
                                        <BlogCard key={post.id} post={post} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-10">
                                        <button
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Trước
                                        </button>
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${p === page
                                                        ? 'bg-brand-accent text-white shadow-md'
                                                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Sau
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="hidden lg:block">
                        <div className="sticky top-24">
                            <BlogSidebar
                                categories={categories}
                                activeCategory={category}
                                searchQuery={searchInput}
                                onCategoryChange={handleCategoryChange}
                                onSearchChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile search (below hero on small screens) */}
                <div className="lg:hidden mt-6">
                    <BlogSidebar
                        categories={categories}
                        activeCategory={category}
                        searchQuery={searchInput}
                        onCategoryChange={handleCategoryChange}
                        onSearchChange={handleSearchChange}
                    />
                </div>
            </section>
        </div>
    );
}
