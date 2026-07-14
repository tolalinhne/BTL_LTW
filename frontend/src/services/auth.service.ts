import api from '@/services/api';
import type { LoginCredentials, RegisterData, AuthResponse, ApiResponse, User } from '@/types/shared.types';

export const authService = {
    login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
        const res = await api.post('/auth/login', credentials);
        return res.data?.data;
    },

    register: async (userData: RegisterData): Promise<AuthResponse> => {
        const res = await api.post('/auth/register', userData);
        return res.data?.data;
    },

    getProfile: async (): Promise<User> => {
        const res = await api.get('/auth/profile');
        return res.data?.data;
    },

    updateProfile: async (profileData: Partial<RegisterData>): Promise<User> => {
        const res = await api.put('/auth/profile', profileData);
        return res.data?.data;
    },

    logout: async () => {
        // Backend doesn't have a logout endpoint — just clear tokens locally
    },

    refreshToken: async (token: string): Promise<{ accessToken: string }> => {
        const res = await api.post('/auth/refresh', { refreshToken: token });
        return res.data?.data;
    }
};
