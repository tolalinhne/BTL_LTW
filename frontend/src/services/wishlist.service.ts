import api from '@/services/api';
import type { Product } from '@/types/user.types';

export const wishlistService = {
    getWishlist: async (): Promise<Product[]> => {
        try {
            const res = await api.get('/wishlist');
            return res.data?.data || [];
        } catch (error) {
            console.error('Lỗi lấy danh sách wishlist:', error);
            return [];
        }
    },

    addToWishlist: async (productId: string): Promise<boolean> => {
        try {
            const res = await api.post(`/wishlist/${productId}`);
            return res.data?.success || false;
        } catch (error) {
            console.error('Lỗi thêm wishlist:', error);
            return false;
        }
    },

    removeFromWishlist: async (productId: string): Promise<boolean> => {
        try {
            const res = await api.delete(`/wishlist/${productId}`);
            return res.data?.success || false;
        } catch (error) {
            console.error('Lỗi xóa wishlist:', error);
            return false;
        }
    }
};
