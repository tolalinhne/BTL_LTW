import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Package, Users, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import DataTable from '@/components/admin/DataTable';
import { adminDashboardService, type DashboardMetrics } from '@/services/admin/dashboard.service';
import { adminOrderService } from '@/services/admin/order.service';
import type { Order } from '@/types/shared.types';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    shipping: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
};

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function Dashboard() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    const fetchMetrics = async () => {
        setIsLoading(true);
        try {
            const [metricsData, ordersData] = await Promise.all([
                adminDashboardService.getMetrics(),
                adminOrderService.getAll({ page: 1, limit: 10 }),
            ]);
            
            if (metricsData) setMetrics(metricsData);
            
            // Handle paginated response format (content array) vs direct array
            const ordersList = ordersData?.content || ordersData?.data || ordersData || [];
            if (Array.isArray(ordersList)) {
                setRecentOrders(ordersList.slice(0, 5));
            }
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const orderColumns = [
        { key: 'id', label: 'Mã đơn', sortable: true },
        { 
             key: 'customer', 
             label: 'Khách hàng',
             render: (item: Order) => (
                 <span>{item.shippingAddress?.fullName || 'Khách vãng lai'}</span>
             )
        },
        {
            key: 'total',
            label: 'Tổng tiền',
            sortable: true,
            render: (item: Order) => (
                <span className="font-medium">{formatVND(item.totalAmount || 0)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: Order) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[item.status.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[item.status.toLowerCase()] || item.status}
                </span>
            ),
        },
        { 
            key: 'createdAt', 
            label: 'Ngày',
            render: (item: Order) => new Date(item.createdAt).toLocaleDateString('vi-VN')
        },
    ];

    if (isLoading && !metrics) {
         return <div className="p-8 text-center text-gray-500">Đang tải biểu đồ...</div>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1">Tổng quan hoạt động kinh doanh</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    title="Doanh thu"
                    value={formatVND(metrics?.totalRevenue || 0)}
                    change={metrics?.revenueChange || 0}
                    icon={<DollarSign size={20} />}
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Đơn hàng"
                    value={(metrics?.totalOrders || 0).toLocaleString()}
                    change={metrics?.ordersChange || 0}
                    icon={<ShoppingBag size={20} />}
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Sản phẩm"
                    value={(metrics?.totalProducts || 0).toLocaleString()}
                    change={metrics?.productsChange || 0}
                    icon={<Package size={20} />}
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Khách hàng"
                    value={(metrics?.totalCustomers || 0).toLocaleString()}
                    change={metrics?.customersChange || 0}
                    icon={<Users size={20} />}
                    color="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Recent Orders */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h2>
                <Link to="/admin/orders" className="flex items-center gap-1 text-sm text-brand-primary hover:underline">
                    Xem tất cả <ArrowUpRight size={14} />
                </Link>
            </div>
            <DataTable columns={orderColumns as any} data={recentOrders} />
        </div>
    );
}
