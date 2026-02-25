import api from './api';

export const productService = {
    getAll: async (params?: Record<string, string | number>) => {
        const { data } = await api.get('/admin/products', { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/admin/products/${id}`);
        return data;
    },
    create: async (product: FormData) => {
        const { data } = await api.post('/admin/products', product);
        return data;
    },
    update: async (id: string, product: FormData) => {
        const { data } = await api.put(`/admin/products/${id}`, product);
        return data;
    },
    delete: async (id: string) => {
        await api.delete(`/admin/products/${id}`);
    },
};
