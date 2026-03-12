import React from 'react';
import { DollarSign, ShoppingBag, Package, Users, ArrowUpRight } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import DataTable from '@/components/admin/DataTable';

const RECENT_ORDERS = [
    { id: 'ORD-001', customer: 'Nguyễn Thị A', total: 1635000, status: 'shipping', date: '25/02/2026' },
    { id: 'ORD-002', customer: 'Trần Văn B', total: 785000, status: 'pending', date: '25/02/2026' },
    { id: 'ORD-003', customer: 'Lê Thị C', total: 2450000, status: 'delivered', date: '24/02/2026' },
    { id: 'ORD-004', customer: 'Phạm Văn D', total: 425000, status: 'confirmed', date: '24/02/2026' },
    { id: 'ORD-005', customer: 'Hoàng Thị E', total: 1250000, status: 'cancelled', date: '23/02/2026' },
];

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
    const orderColumns = [
        { key: 'id', label: 'Mã đơn', sortable: true },
        { key: 'customer', label: 'Khách hàng' },
        {
            key: 'total',
            label: 'Tổng tiền',
            sortable: true,
            render: (item: (typeof RECENT_ORDERS)[0]) => (
                <span className="font-medium">{formatVND(item.total)}</span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: (typeof RECENT_ORDERS)[0]) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                </span>
            ),
        },
        { key: 'date', label: 'Ngày' },
    ];

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
                    value={formatVND(125600000)}
                    change={12.5}
                    icon={<DollarSign size={20} />}
                    color="bg-green-100 text-green-600"
                />
                <StatCard
                    title="Đơn hàng"
                    value="1,284"
                    change={8.2}
                    icon={<ShoppingBag size={20} />}
                    color="bg-blue-100 text-blue-600"
                />
                <StatCard
                    title="Sản phẩm"
                    value="356"
                    change={3.1}
                    icon={<Package size={20} />}
                    color="bg-purple-100 text-purple-600"
                />
                <StatCard
                    title="Khách hàng"
                    value="2,451"
                    change={15.3}
                    icon={<Users size={20} />}
                    color="bg-orange-100 text-orange-600"
                />
            </div>

            {/* Recent Orders */}
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Đơn hàng gần đây</h2>
                <button className="flex items-center gap-1 text-sm text-primary hover:underline">
                    Xem tất cả <ArrowUpRight size={14} />
                </button>
            </div>
            <DataTable columns={orderColumns} data={RECENT_ORDERS} />
        </div>
    );
}
