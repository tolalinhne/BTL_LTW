import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, X, Sparkles } from 'lucide-react';
import { adminBlogService } from '@/services/admin/blog.service';
import type { BlogFormData } from '@/types/admin.types';

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

const defaultForm: BlogFormData = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail: '',
    category: '',
    tags: [],
    status: 'draft',
};

export default function BlogForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditing = Boolean(id);
    const categories = useMemo(() => adminBlogService.getCategories(), []);

    const [form, setForm] = useState<BlogFormData>(defaultForm);
    const [tagInput, setTagInput] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [toast, setToast] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (id) {
            fetchBlog(id);
        }
    }, [id]);

    const fetchBlog = async (blogId: string) => {
        setIsLoading(true);
        try {
            const existing = await adminBlogService.getById(blogId);
            if (existing) {
                setForm({
                    title: existing.title,
                    slug: existing.slug,
                    excerpt: existing.excerpt || '',
                    content: existing.content,
                    thumbnail: existing.thumbnail || '',
                    category: existing.category,
                    tags: existing.tags || [],
                    status: existing.status,
                });
            }
        } catch (error) {
            console.error("Lỗi khi tải bài viết", error);
            showToast("Lỗi tải bài viết");
        } finally {
            setIsLoading(false);
        }
    };

    const update = (key: keyof BlogFormData, value: unknown) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleTitleChange = (title: string) => {
        update('title', title);
        if (!isEditing || form.slug === generateSlug(form.title)) {
            update('slug', generateSlug(title));
        }
    };

    const handleAddTag = () => {
        const tag = tagInput.trim();
        if (tag && !form.tags.includes(tag)) {
            update('tags', [...form.tags, tag]);
        }
        setTagInput('');
    };

    const handleRemoveTag = (tag: string) => {
        update('tags', form.tags.filter((t) => t !== tag));
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                showToast('Ảnh quá lớn! Kích thước tối đa là 10MB.');
                return;
            }
            if (!file.type.startsWith('image/')) {
                showToast('Chỉ chấp nhận file ảnh (PNG, JPG, WEBP).');
                return;
            }
            try {
                showToast('Đang tải ảnh lên...');
                const { uploadService } = await import('@/services/admin/upload.service');
                const result = await uploadService.uploadImage(file, 'blog');
                update('thumbnail', result.url);
                showToast('Tải ảnh thành công!');
            } catch (error) {
                console.error("Lỗi upload ảnh", error);
                showToast("Lỗi upload ảnh. Vui lòng thử lại.");
            }
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const handleSave = async (status: 'draft' | 'published') => {
        if (!form.title.trim()) {
            showToast('Vui lòng nhập tiêu đề bài viết');
            return;
        }

        setIsSaving(true);
        const data: BlogFormData = { ...form, status };

        try {
            if (isEditing && id) {
                await adminBlogService.update(id, data);
                 showToast('Cập nhật bài viết thành công!');
            } else {
                 await adminBlogService.create(data);
                 showToast(status === 'published' ? 'Đã đăng bài viết!' : 'Đã lưu nháp!');
            }
            setTimeout(() => navigate('/admin/blog'), 1000);
        } catch(error) {
             console.error("Lỗi khi lưu bài viết", error);
             showToast("Lỗi khi lưu bài viết");
        } finally {
             setIsSaving(false);
        }
    };

    if (isLoading) {
         return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/admin/blog')}
                        className="p-2 text-gray-500 hover:text-brand-primary hover:bg-brand-accent/10 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isEditing ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEditing ? 'Chỉnh sửa nội dung bài viết' : 'Viết nội dung mới cho blog'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border transition-all ${showPreview
                                ? 'bg-brand-primary text-white border-brand-primary'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Eye size={16} /> Preview
                    </button>
                    <button
                        onClick={() => handleSave('draft')}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                    >
                        <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
                    </button>
                    <button
                        onClick={() => handleSave('published')}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-xl hover:bg-brand-primary/90 shadow-md shadow-brand-primary/20 transition-all disabled:opacity-50"
                    >
                        <Sparkles size={16} /> {isSaving ? 'Đang xử lý...' : 'Publish'}
                    </button>
                </div>
            </div>

            <div className={`grid ${showPreview ? 'grid-cols-2 gap-6' : 'grid-cols-1'}`}>
                {/* Form */}
                <div className="space-y-5">
                    {/* Title */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tiêu đề</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            placeholder="Nhập tiêu đề bài viết..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary transition-all"
                        />
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-xs text-gray-400">Slug:</span>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => update('slug', e.target.value)}
                                className="flex-1 px-2 py-1 text-xs text-gray-500 bg-gray-50 border border-gray-100 rounded-lg"
                            />
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Thumbnail</label>
                        {form.thumbnail ? (
                            <div className="relative rounded-xl overflow-hidden">
                                <img src={form.thumbnail} alt="Thumbnail" className="w-full h-48 object-cover rounded-xl" />
                                <button
                                    onClick={() => update('thumbnail', '')}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-lg hover:bg-black/70 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-brand-primary/40 hover:bg-brand-accent/10 transition-all">
                                <Upload size={24} className="text-gray-300 mb-2" />
                                <span className="text-sm text-gray-400">Chọn ảnh thumbnail</span>
                                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" />
                            </label>
                        )}
                    </div>

                    {/* Category + Tags */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Danh mục</label>
                            <select
                                value={form.category}
                                onChange={(e) => update('category', e.target.value)}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary transition-all"
                            >
                                <option value="">Chọn danh mục</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                    placeholder="Nhập tag..."
                                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary transition-all"
                                />
                                <button
                                    onClick={handleAddTag}
                                    className="px-3 py-2.5 bg-brand-primary text-white text-sm rounded-xl hover:bg-brand-primary/90 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                            {form.tags && form.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {form.tags.map((tag) => (
                                        <span key={tag} className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-accent/10 text-brand-primary text-xs font-medium rounded-lg">
                                            #{tag}
                                            <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-500 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Mô tả ngắn</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => update('excerpt', e.target.value)}
                            placeholder="Mô tả ngắn gọn nội dung bài viết..."
                            rows={3}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary transition-all"
                        />
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                            Nội dung <span className="text-gray-300 font-normal normal-case">(HTML)</span>
                        </label>
                        <textarea
                            value={form.content}
                            onChange={(e) => update('content', e.target.value)}
                            placeholder="<h2>Tiêu đề</h2>\n<p>Nội dung bài viết...</p>"
                            rows={12}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary transition-all"
                        />
                    </div>
                </div>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6 self-start">
                        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                            <Eye size={14} className="text-gray-400" />
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Preview</span>
                        </div>
                        <div className="p-5 max-h-[calc(100vh-160px)] overflow-y-auto custom-scrollbar">
                            {form.thumbnail && (
                                <img src={form.thumbnail} alt="" className="w-full h-40 object-cover rounded-xl mb-4" />
                            )}
                            {form.category && (
                                <span className="inline-block px-2.5 py-1 bg-brand-primary/10 text-brand-primary text-[11px] font-semibold rounded-full mb-3">
                                    {form.category}
                                </span>
                            )}
                            <h2 className="text-xl font-bold text-gray-900 mb-2">
                                {form.title || 'Tiêu đề bài viết'}
                            </h2>
                            {form.excerpt && (
                                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{form.excerpt}</p>
                            )}
                            <div
                                className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-600 prose-blockquote:border-l-brand-primary prose-img:rounded-lg"
                                dangerouslySetInnerHTML={{ __html: form.content || '<p class="text-gray-300 italic">Nội dung sẽ hiển thị ở đây...</p>' }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg animate-[fadeIn_0.3s_ease]">
                    {toast}
                </div>
            )}
        </div>
    );
}
