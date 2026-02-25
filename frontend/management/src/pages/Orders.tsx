import React, { useState } from 'react';
import { Search, Eye, ChevronDown } from 'lucide-react';
import DataTable from '@/components/DataTable';

const MOCK_ORDERS = [
    { id: 'ORD-001', customer: 'Nguyễn Thị A', email: 'a@mail.com', total: 1635000, items: 3, status: 'shipping', date: '25/02/2026' },
    { id: 'ORD-002', customer: 'Trần Văn B', email: 'b@mail.com', total: 785000, items: 1, status: 'pending', date: '25/02/2026' },
    { id: 'ORD-003', customer: 'Lê Thị C', email: 'c@mail.com', total: 2450000, items: 4, status: 'delivered', date: '24/02/2026' },
    { id: 'ORD-004', customer: 'Phạm Văn D', email: 'd@mail.com', total: 425000, items: 1, status: 'confirmed', date: '24/02/2026' },
    { id: 'ORD-005', customer: 'Hoàng Thị E', email: 'e@mail.com', total: 1250000, items: 2, status: 'cancelled', date: '23/02/2026' },
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

export default function Orders() {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const filtered = MOCK_ORDERS.filter((o) => {
        const matchSearch = o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const columns = [
        { key: 'id', label: 'Mã đơn', sortable: true },
        {
            key: 'customer',
            label: 'Khách hàng',
            render: (item: (typeof MOCK_ORDERS)[0]) => (
                <div>
                    <p className="font-medium text-gray-900">{item.customer}</p>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </div>
            ),
        },
        { key: 'items', label: 'SP' },
        {
            key: 'total',
            label: 'Tổng tiền',
            sortable: true,
            render: (item: (typeof MOCK_ORDERS)[0]) => <span className="font-medium">{formatVND(item.total)}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: (typeof MOCK_ORDERS)[0]) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABELS[item.status]}
                </span>
            ),
        },
        { key: 'date', label: 'Ngày', sortable: true },
        {
            key: 'actions',
            label: '',
            render: () => (
                <button className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100">
                    <Eye size={16} />
                </button>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">{MOCK_ORDERS.length} đơn hàng</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm đơn hàng, khách hàng..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <DataTable columns={columns} data={filtered} />
        </div>
    );
}
