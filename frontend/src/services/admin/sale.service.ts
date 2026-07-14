import api from '@/services/api';

export interface SaleItem {
    id: number;
    name: string;
    discountPercent: number;
    couponCode?: string;
    startTime?: string;
    endTime?: string;
    status: 'draft' | 'active' | 'ended';
    active: boolean;
    productIds: number[];
    createdAt: string;
}

export const adminSaleService = {
    getAll: async (): Promise<SaleItem[]> => {
        const res = await api.get('/admin/sales');
        return res.data?.data || [];
    },
    getById: async (id: number): Promise<SaleItem> => {
        const res = await api.get(`/admin/sales/${id}`);
        return res.data?.data;
    },
    create: async (data: Partial<SaleItem>): Promise<SaleItem> => {
        const res = await api.post('/admin/sales', data);
        return res.data?.data;
    },
    update: async (id: number, data: Partial<SaleItem>): Promise<SaleItem> => {
        const res = await api.put(`/admin/sales/${id}`, data);
        return res.data?.data;
    },
    delete: async (id: number): Promise<void> => {
        await api.delete(`/admin/sales/${id}`);
    },
};

export const getActiveSales = async (): Promise<SaleItem[]> => {
    try {
        const res = await api.get('/sales/active');
        return res.data?.data || [];
    } catch {
        return [];
    }
};
