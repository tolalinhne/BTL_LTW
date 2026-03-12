import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import type { BlogPost } from '@/types/user.types';

interface RelatedPostsProps {
    posts: BlogPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
    if (posts.length === 0) return null;

    return (
        <section className="mt-16 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
                <h2 className="font-serif text-2xl font-bold text-brand-primary">Bài viết liên quan</h2>
                <Link
                    to="/blog"
                    className="text-sm font-medium text-brand-accent hover:underline flex items-center gap-1"
                >
                    Xem tất cả <ArrowRight size={14} />
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {posts.map((post) => (
                    <Link
                        key={post.id}
                        to={`/blog/${post.slug}`}
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                    >
                        <div className="aspect-[16/10] overflow-hidden">
                            <img
                                src={post.thumbnail}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        </div>
                        <div className="p-4">
                            <span className="text-[11px] font-semibold text-brand-accent uppercase">
                                {post.category.name}
                            </span>
                            <h3 className="font-serif text-sm font-bold text-brand-primary mt-1 group-hover:text-brand-accent transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                                <Calendar size={11} />
                                {new Date(post.publishedAt).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
