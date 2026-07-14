import api from '@/services/api';

export interface DashboardMetrics {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    totalProducts: number;
    productsChange: number;
    totalCustomers: number;
    customersChange: number;
}

export const adminDashboardService = {
    getMetrics: async (): Promise<DashboardMetrics> => {
        const res = await api.get('/admin/dashboard/metrics');
        return res.data?.data;
    }
};
