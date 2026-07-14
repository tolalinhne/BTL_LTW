import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { adminBlogService } from '@/services/admin/blog.service';
import type { AdminBlogPost } from '@/types/admin.types';

export default function BlogList() {
    const [blogs, setBlogs] = useState<AdminBlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'' | 'draft' | 'published'>('');
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchBlogs();
    }, []);

    const fetchBlogs = async () => {
        setIsLoading(true);
        try {
            const data = await adminBlogService.getAll();
            if (Array.isArray(data)) {
                setBlogs(data);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách blog:", error);
            showToast('Lỗi khi tải danh sách bài viết');
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = useMemo(() => {
        let list = blogs;
        if (search) {
            const q = search.toLowerCase();
            list = list.filter((b) => b.title.toLowerCase().includes(q));
        }
        if (statusFilter) {
            list = list.filter((b) => b.status === statusFilter);
        }
        return list;
    }, [blogs, search, statusFilter]);

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await adminBlogService.delete(deleteId);
                setDeleteId(null);
                await fetchBlogs();
                showToast('Đã xóa bài viết thành công');
            } catch (error) {
                console.error("Lỗi khi xóa blog:", error);
                showToast('Lỗi khi xóa bài viết');
            }
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Blog</h1>
                    <p className="text-sm text-gray-500 mt-1">{filtered.length} bài viết</p>
                </div>
                <Link
                    to="/admin/blog/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-xl hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20 transition-all"
                >
                    <Plus size={18} /> Tạo bài viết
                </Link>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm bài viết..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as '' | 'draft' | 'published')}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary transition-all"
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Bài viết</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Danh mục</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Trạng thái</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Tác giả</th>
                                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Ngày tạo</th>
                                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                                        Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                                        Không có bài viết nào.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((blog) => (
                                    <tr key={blog.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={blog.thumbnail || 'https://placehold.co/800x500'}
                                                    alt={blog.title}
                                                    className="w-12 h-9 rounded-lg object-cover flex-shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate max-w-[260px]">{blog.title}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-[260px]">{blog.excerpt}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-block px-2.5 py-1 bg-brand-accent/10 text-brand-primary text-xs font-medium rounded-lg">
                                                {blog.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${blog.status === 'published'
                                                ? 'bg-green-50 text-green-600'
                                                : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${blog.status === 'published' ? 'bg-green-500' : 'bg-amber-500'
                                                    }`} />
                                                {blog.status === 'published' ? 'Published' : 'Draft'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{blog.author || 'Admin'}</td>
                                        <td className="px-5 py-4 text-sm text-gray-500">{formatDate(blog.createdAt)}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    to={`/admin/blog/${blog.id}/edit`}
                                                    className="p-2 text-gray-400 hover:text-brand-primary hover:bg-brand-accent/10 rounded-lg transition-all"
                                                    title="Sửa"
                                                >
                                                    <Pencil size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => setDeleteId(blog.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-sm text-gray-500 mb-6">Bạn có chắc muốn xóa bài viết này? Hành động không thể hoàn tác.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg animate-[fadeIn_0.3s_ease]">
                    {toast}
                </div>
            )}
        </div>
    );
}
