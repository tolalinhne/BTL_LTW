import api from '@/services/api';
import type { UserBlogPost, BlogCategory } from '@/types/user.types';

// ===== Service Functions (gọi API backend) =====

export interface BlogListParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}

export async function getCategories(): Promise<BlogCategory[]> {
    try {
        const res = await api.get('/blog/categories');
        return res.data?.data || [];
    } catch {
        return [];
    }
}

export async function getBlogs(params: BlogListParams = {}): Promise<{ data: UserBlogPost[]; total: number }> {
    try {
        const res = await api.get('/blog', { params });
        const result = res.data?.data;
        if (result?.data) {
            return { data: result.data, total: result.total || result.data.length };
        }
        if (Array.isArray(result)) {
            return { data: result, total: result.length };
        }
        return { data: [], total: 0 };
    } catch {
        return { data: [], total: 0 };
    }
}

export async function getBlogBySlug(slug: string): Promise<UserBlogPost | undefined> {
    try {
        const res = await api.get(`/blog/${slug}`);
        return res.data?.data;
    } catch {
        return undefined;
    }
}

export async function getRelatedPosts(slug: string, limit = 3): Promise<UserBlogPost[]> {
    try {
        const res = await api.get(`/blog/${slug}/related`, { params: { limit } });
        return res.data?.data || [];
    } catch {
        // Fallback: get regular blog posts
        const { data } = await getBlogs({ limit });
        return data.filter((b) => b.slug !== slug).slice(0, limit);
    }
}
