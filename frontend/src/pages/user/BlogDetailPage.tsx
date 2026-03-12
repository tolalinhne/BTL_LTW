import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Share2, Facebook, Twitter, LinkIcon, ArrowLeft } from 'lucide-react';
import { getBlogBySlug, getRelatedPosts } from '@/services/blog.service';
import RelatedPosts from '@/components/user/blog/RelatedPosts';

export default function BlogDetailPage() {
    const { slug } = useParams<{ slug: string }>();

    const post = useMemo(() => (slug ? getBlogBySlug(slug) : undefined), [slug]);
    const related = useMemo(() => (slug ? getRelatedPosts(slug) : []), [slug]);

    if (!post) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <h2 className="font-serif text-3xl font-bold text-brand-primary mb-3">Bài viết không tồn tại</h2>
                <p className="text-gray-500 mb-6">Bài viết bạn đang tìm có thể đã bị xóa hoặc đường dẫn không đúng.</p>
                <Link
                    to="/blog"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                >
                    <ArrowLeft size={16} /> Quay lại Blog
                </Link>
            </div>
        );
    }

    const formattedDate = new Date(post.publishedAt).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const shareUrl = window.location.href;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(shareUrl);
    };

    return (
        <article>
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3">
                    <nav className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Link to="/" className="hover:text-brand-primary transition-colors">Trang chủ</Link>
                        <ChevronRight size={12} />
                        <Link to="/blog" className="hover:text-brand-primary transition-colors">Blog</Link>
                        <ChevronRight size={12} />
                        <span className="text-brand-primary font-medium truncate max-w-[200px]">{post.title}</span>
                    </nav>
                </div>
            </div>

            {/* Hero Image */}
            <div className="w-full max-h-[480px] overflow-hidden">
                <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
                {/* Category + Tags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-block px-3 py-1 bg-brand-accent text-white text-[11px] font-semibold rounded-full">
                        {post.category.name}
                    </span>
                    {post.tags.map((tag) => (
                        <span
                            key={tag}
                            className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-full"
                        >
                            #{tag}
                        </span>
                    ))}
                </div>

                {/* Title */}
                <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-primary leading-tight mb-6">
                    {post.title}
                </h1>

                {/* Author + Meta */}
                <div className="flex flex-wrap items-center gap-4 pb-8 border-b border-gray-200 mb-8">
                    <div className="flex items-center gap-3">
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-accent/20"
                        />
                        <div>
                            <p className="text-sm font-semibold text-brand-primary">{post.author.name}</p>
                            {post.author.role && (
                                <p className="text-xs text-gray-400">{post.author.role}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                            <Calendar size={13} /> {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={13} /> {post.readingTime} phút đọc
                        </span>
                    </div>
                </div>

                {/* Article content */}
                <div
                    className="prose prose-lg max-w-none
                        prose-headings:font-serif prose-headings:text-brand-primary
                        prose-p:text-gray-700 prose-p:leading-relaxed
                        prose-a:text-brand-accent prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-brand-accent prose-blockquote:bg-brand-accent/5 prose-blockquote:rounded-r-xl prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-gray-600
                        prose-img:rounded-2xl prose-img:shadow-md prose-img:mx-auto
                        prose-strong:text-brand-primary
                    "
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Share */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-sm font-medium text-gray-600">
                            <Share2 size={16} /> Chia sẻ:
                        </span>
                        <a
                            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                        >
                            <Facebook size={16} />
                        </a>
                        <a
                            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-9 h-9 rounded-full bg-sky-50 text-sky-500 hover:bg-sky-100 flex items-center justify-center transition-colors"
                        >
                            <Twitter size={16} />
                        </a>
                        <button
                            onClick={handleCopyLink}
                            className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
                            title="Sao chép link"
                        >
                            <LinkIcon size={16} />
                        </button>
                    </div>
                </div>

                {/* Related Posts */}
                <RelatedPosts posts={related} />
            </div>
        </article>
    );
}
