import api from './api';

export const orderService = {
    getAll: async (params?: Record<string, string | number>) => {
        const { data } = await api.get('/admin/orders', { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/admin/orders/${id}`);
        return data;
    },
    updateStatus: async (id: string, status: string) => {
        const { data } = await api.put(`/admin/orders/${id}/status`, { status });
        return data;
    },
};
