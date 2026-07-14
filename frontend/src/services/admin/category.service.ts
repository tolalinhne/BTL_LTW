import api from '@/services/api';
import type { ApiResponse } from '@/types/shared.types';

export interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    description: string;
    productCount: number;
    isFeatured: boolean;
}

export const adminCategoryService = {
    getAll: async (params?: Record<string, string | number>) => {
        const res = await api.get('/categories', { params });
        return res.data;
    },
    
    getById: async (id: string): Promise<CategoryItem> => {
        const res = await api.get(`/admin/categories/${id}`);
        return res.data?.data;
    },
    
    create: async (data: Partial<CategoryItem>): Promise<CategoryItem> => {
        const res = await api.post('/admin/categories', data);
        return res.data?.data;
    },
    
    update: async (id: string, data: Partial<CategoryItem>): Promise<CategoryItem> => {
        const res = await api.put(`/admin/categories/${id}`, data);
        return res.data?.data;
    },
    
    delete: async (id: string): Promise<void> => {
        await api.delete(`/admin/categories/${id}`);
    },

    toggleFeatured: async (id: string, isFeatured: boolean): Promise<CategoryItem> => {
        const res = await api.put(`/admin/categories/${id}/featured`, { isFeatured });
        return res.data?.data;
    }
};
