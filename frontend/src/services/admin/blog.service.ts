import api from '@/services/api';
import type { AdminBlogPost, BlogFormData } from '@/types/admin.types';

// ===== Categories (Mock for now if no specific endpoint) =====
export const BLOG_CATEGORIES = ['Xu hướng', 'Phong cách', 'Mẹo thời trang', 'Tin tức', 'Hậu trường'];

export const adminBlogService = {
    getCategories: (): string[] => {
        return BLOG_CATEGORIES;
    },

    getAll: async (params?: Record<string, string | number>) => {
        const res = await api.get('/admin/blog', { params });
        return res.data?.data;
    },

    getById: async (id: string): Promise<AdminBlogPost> => {
        const res = await api.get(`/admin/blog/${id}`);
        return res.data?.data;
    },

    create: async (data: BlogFormData): Promise<AdminBlogPost> => {
        const res = await api.post('/admin/blog', data);
        return res.data?.data;
    },

    update: async (id: string, data: Partial<BlogFormData>): Promise<AdminBlogPost> => {
        const res = await api.put(`/admin/blog/${id}`, data);
        return res.data?.data;
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/admin/blog/${id}`);
    },
    
    uploadImage: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post('/admin/blog/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return res.data?.data;
    }
};
