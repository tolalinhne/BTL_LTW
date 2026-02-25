import api from './api';
import type { Product, PaginatedResponse } from '@/types';

export const productService = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        category?: string;
        search?: string;
        sort?: string;
    }): Promise<PaginatedResponse<Product>> => {
        const { data } = await api.get('/products', { params });
        return data;
    },

    getById: async (id: string): Promise<Product> => {
        const { data } = await api.get(`/products/${id}`);
        return data;
    },

    getByCategory: async (category: string): Promise<Product[]> => {
        const { data } = await api.get(`/products/category/${category}`);
        return data;
    },

    search: async (query: string): Promise<Product[]> => {
        const { data } = await api.get('/products/search', { params: { q: query } });
        return data;
    },
};
