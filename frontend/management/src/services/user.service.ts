import api from './api';

export const userService = {
    getAll: async (params?: Record<string, string | number>) => {
        const { data } = await api.get('/admin/users', { params });
        return data;
    },
    getById: async (id: string) => {
        const { data } = await api.get(`/admin/users/${id}`);
        return data;
    },
    create: async (user: Record<string, string>) => {
        const { data } = await api.post('/admin/users', user);
        return data;
    },
    update: async (id: string, user: Record<string, string>) => {
        const { data } = await api.put(`/admin/users/${id}`, user);
        return data;
    },
    delete: async (id: string) => {
        await api.delete(`/admin/users/${id}`);
    },
};
