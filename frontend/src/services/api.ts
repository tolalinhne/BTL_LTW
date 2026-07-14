import axios from 'axios';
import { adminTokenStorage, userTokenStorage } from '@/utils/token';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Pick the right token based on request URL
function getStorageForRequest(url?: string) {
    if (url?.includes('/admin/')) return adminTokenStorage;
    // For upload and other endpoints, use context based on current page
    if (window.location.pathname.startsWith('/admin')) return adminTokenStorage;
    return userTokenStorage;
}

// Background endpoints that should NOT redirect on 401 (silent fail)
const SILENT_ENDPOINTS = ['/cart', '/wishlist'];

// Request interceptor — attach auth token based on request URL
api.interceptors.request.use(
    (config) => {
        const storage = getStorageForRequest(config.url);
        const token = storage.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor — refresh token on 401, then auto-logout
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const storage = getStorageForRequest(originalRequest.url);
            try {
                const refreshToken = storage.getRefreshToken();
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }
                const res = await axios.post(
                    `${api.defaults.baseURL}/auth/refresh`,
                    { refreshToken }
                );
                const newAccessToken = res.data?.data?.accessToken;
                if (newAccessToken) {
                    storage.setToken(newAccessToken);
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return api(originalRequest);
                } else {
                    throw new Error('Refresh token failed');
                }
            } catch {
                storage.clear(); // Always clear corrupted/expired token
                window.dispatchEvent(new Event('auth-expired')); // Notify AuthContext

                // Only redirect for non-silent endpoints
                const isSilent = SILENT_ENDPOINTS.some(ep => originalRequest.url?.includes(ep));
                if (!isSilent) {
                    const isAdmin = originalRequest.url?.includes('/admin/');
                    window.location.href = isAdmin ? '/admin/login' : '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
