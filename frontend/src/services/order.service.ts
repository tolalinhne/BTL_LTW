import api from '@/services/api';
import type { Order, ApiResponse } from '@/types/shared.types';
import type { CartItem } from '@/types/user.types';

export interface CreateOrderData {
    items: CartItem[];
    shippingAddress: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    note?: string;
}

export const orderService = {
    create: async (orderData: CreateOrderData): Promise<ApiResponse<Order>> => {
        const res = await api.post('/orders', orderData);
        return res.data;
    },

    getMyOrders: async (page = 0, size = 10): Promise<ApiResponse<{ content: Order[], totalElements: number, totalPages: number }>> => {
        return api.get(`/orders/my?page=${page}&size=${size}`);
    },

    getById: async (id: string | number): Promise<ApiResponse<Order>> => {
        const res = await api.get(`/orders/${id}`);
        return res.data;
    },

    cancelOrder: async (id: string): Promise<ApiResponse<Order>> => {
        return api.put(`/orders/${id}/cancel`);
    },

    /**
     * Poll trạng thái đơn hàng cho đến khi được xác nhận hoặc hết timeout.
     * @param orderId ID đơn hàng
     * @param onConfirmed Callback khi đơn hàng được xác nhận thanh toán
     * @param onTimeout Callback khi hết thời gian chờ
     * @param intervalMs Khoảng thời gian poll (ms), mặc định 3000ms
     * @param timeoutMs Thời gian timeout tối đa (ms), mặc định 10 phút
     * @returns Hàm để dừng polling
     */
    pollPaymentStatus: (
        orderId: string | number,
        onConfirmed: (order: Order) => void,
        onTimeout: () => void,
        intervalMs = 3000,
        timeoutMs = 10 * 60 * 1000
    ) => {
        const startTime = Date.now();
        let timerId: ReturnType<typeof setInterval> | null = null;

        const check = async () => {
            try {
                const elapsed = Date.now() - startTime;
                if (elapsed >= timeoutMs) {
                    if (timerId) clearInterval(timerId);
                    onTimeout();
                    return;
                }

                const res = await api.get(`/orders/${orderId}`);
                const order: Order = res.data?.data || res.data;
                if (order?.status === 'confirmed' || (order?.status as string) === 'CONFIRMED') {
                    if (timerId) clearInterval(timerId);
                    onConfirmed(order);
                }
            } catch (e) {
                console.error('Poll payment status error:', e);
            }
        };

        timerId = setInterval(check, intervalMs);

        // Trả về hàm stop để component có thể gọi khi unmount
        return () => {
            if (timerId) clearInterval(timerId);
        };
    },
};
