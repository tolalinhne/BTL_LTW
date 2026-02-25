import api from './api';

export const authService = {
    login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        return data;
    },
    getProfile: async () => {
        const { data } = await api.get('/auth/profile');
        return data;
    },
    logout: async () => {
        await api.post('/auth/logout');
    },
};
