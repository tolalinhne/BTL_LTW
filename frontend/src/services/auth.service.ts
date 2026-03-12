import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse } from '@/types/shared.types';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/login', credentials);
        return data;
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const { data } = await api.post<AuthResponse>('/auth/register', userData);
        return data;
    },

    getProfile: async () => {
        const { data } = await api.get('/auth/profile');
        return data;
    },

    updateProfile: async (profileData: Partial<RegisterData>) => {
        const { data } = await api.put('/auth/profile', profileData);
        return data;
    },

    logout: async () => {
        await api.post('/auth/logout');
    },
};
