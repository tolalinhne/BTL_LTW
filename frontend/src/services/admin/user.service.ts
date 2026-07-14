import api from '@/services/api';
import type { User } from '@/types/shared.types';

export const adminUserService = {
    getAll: async (params?: Record<string, string | number>) => {
        const res = await api.get('/admin/users', { params });
        return res.data?.data;
    },
    getById: async (id: string): Promise<User> => {
        const res = await api.get(`/admin/users/${id}`);
        return res.data?.data;
    },
    create: async (user: Record<string, string>): Promise<User> => {
        const res = await api.post('/admin/users', user);
        return res.data?.data;
    },
    update: async (id: string, user: Record<string, string>): Promise<User> => {
        const res = await api.put(`/admin/users/${id}`, user);
        return res.data?.data;
    },
    delete: async (id: string): Promise<void> => {
        await api.delete(`/admin/users/${id}`);
    },
};
