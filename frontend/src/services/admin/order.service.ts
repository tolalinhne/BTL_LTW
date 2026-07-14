import api from '@/services/api';
import type { Order } from '@/types/shared.types';

export const adminOrderService = {
    getAll: async (params?: Record<string, string | number>) => {
        const res = await api.get('/admin/orders', { params });
        return res.data?.data;
    },
    getById: async (id: string): Promise<Order> => {
        const res = await api.get(`/admin/orders/${id}`);
        return res.data?.data;
    },
    updateStatus: async (id: string, status: string): Promise<Order> => {
        const res = await api.put(`/admin/orders/${id}/status`, { status });
        return res.data?.data;
    },
};
