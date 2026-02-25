import api from './api';
import type { Order, CartItem } from '@/types';

export interface CreateOrderData {
    items: CartItem[];
    shippingAddress: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    note?: string;
}

export const orderService = {
    create: async (orderData: CreateOrderData): Promise<Order> => {
        const { data } = await api.post('/orders', orderData);
        return data;
    },

    getMyOrders: async (): Promise<Order[]> => {
        const { data } = await api.get('/orders/my');
        return data;
    },

    getById: async (id: string): Promise<Order> => {
        const { data } = await api.get(`/orders/${id}`);
        return data;
    },

    cancelOrder: async (id: string): Promise<Order> => {
        const { data } = await api.put(`/orders/${id}/cancel`);
        return data;
    },
};
