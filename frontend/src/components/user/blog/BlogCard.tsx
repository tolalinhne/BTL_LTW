import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User } from 'lucide-react';
import type { BlogPost } from '@/types/user.types';

interface BlogCardProps {
    post: BlogPost;
}

export default function BlogCard({ post }: BlogCardProps) {
    const formattedDate = new Date(post.publishedAt).toLocaleDateString('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <Link
            to={`/blog/${post.slug}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
        >
            {/* Thumbnail */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                    <span className="inline-block px-3 py-1 bg-brand-accent text-white text-[11px] font-semibold rounded-full shadow-sm">
                        {post.category.name}
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-serif text-lg font-bold text-brand-primary leading-snug mb-2 group-hover:text-brand-accent transition-colors line-clamp-2">
                    {post.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
                    {post.excerpt}
                </p>

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-gray-400 border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-1.5">
                        <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="font-medium text-gray-600">{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {formattedDate}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {post.readingTime} phút
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

/* Skeleton variant */
export function BlogCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
            <div className="aspect-[16/10] bg-gray-200" />
            <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-100 rounded w-full" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="flex justify-between pt-3 border-t border-gray-100">
                    <div className="h-3 bg-gray-100 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
            </div>
        </div>
    );
}
