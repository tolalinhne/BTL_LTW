import api from '@/services/api';
import type { Product } from '@/types/user.types';

export const adminProductService = {
    getAll: async (params?: Record<string, string | number>) => {
        const res = await api.get('/admin/products', { params });
        return res.data;
    },
    getById: async (id: string): Promise<Product> => {
        const res = await api.get(`/admin/products/${id}`);
        return res.data?.data;
    },
    create: async (product: any): Promise<Product> => {
        const res = await api.post('/admin/products', product);
        return res.data?.data;
    },
    update: async (id: string, product: any): Promise<Product> => {
        const res = await api.put(`/admin/products/${id}`, product);
        return res.data?.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/admin/products/${id}`);
    },
    toggleFeatured: async (id: string): Promise<Product> => {
        const res = await api.patch(`/admin/products/${id}/toggle-featured`);
        return res.data?.data;
    },
};


