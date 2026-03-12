import React, { useState } from 'react';
import { Search, Eye, ChevronDown, X, Package } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';

const MOCK_ORDERS = [
    {
        id: 'ORD-001', customer: 'Nguyễn Thị A', email: 'a@mail.com', phone: '0912345678', address: '123 Nguyễn Trãi, Hà Đông, Hà Nội',
        total: 1635000, items: [
            { name: 'Lily Floral Dress', qty: 1, price: 785000, size: 'M', color: '#f8d7da', image: 'https://picsum.photos/seed/dress1/80/80' },
            { name: 'Garden Bloom Midi Dress', qty: 1, price: 850000, size: 'S', color: '#f8d7da', image: 'https://picsum.photos/seed/dress2/80/80' },
        ],
        status: 'shipping', date: '25/02/2026', paymentMethod: 'COD',
    },
    {
        id: 'ORD-002', customer: 'Trần Văn B', email: 'b@mail.com', phone: '0987654321', address: '456 Lê Lợi, Q1, TP.HCM',
        total: 785000, items: [
            { name: 'Lily Floral Dress', qty: 1, price: 785000, size: 'L', color: '#d1ecf1', image: 'https://picsum.photos/seed/dress1/80/80' },
        ],
        status: 'pending', date: '25/02/2026', paymentMethod: 'Chuyển khoản',
    },
    {
        id: 'ORD-003', customer: 'Lê Thị C', email: 'c@mail.com', phone: '0933344455', address: '789 Trần Phú, Đà Nẵng',
        total: 2450000, items: [
            { name: 'Classic Tailored Blazer', qty: 1, price: 1250000, size: 'M', color: '#000000', image: 'https://picsum.photos/seed/blazer1/80/80' },
            { name: 'Pastel Blouse', qty: 2, price: 425000, size: 'S', color: '#e2e3e5', image: 'https://picsum.photos/seed/blouse1/80/80' },
            { name: 'Signature Tote Bag', qty: 1, price: 320000, size: 'Free', color: '#8b4513', image: 'https://picsum.photos/seed/bag1/80/80' },
        ],
        status: 'delivered', date: '24/02/2026', paymentMethod: 'COD',
    },
    {
        id: 'ORD-004', customer: 'Phạm Văn D', email: 'd@mail.com', phone: '0966677788', address: '12 Hùng Vương, Huế',
        total: 425000, items: [
            { name: 'Pastel Blouse', qty: 1, price: 425000, size: 'M', color: '#f8d7da', image: 'https://picsum.photos/seed/blouse1/80/80' },
        ],
        status: 'confirmed', date: '24/02/2026', paymentMethod: 'Chuyển khoản',
    },
    {
        id: 'ORD-005', customer: 'Hoàng Thị E', email: 'e@mail.com', phone: '0955566677', address: '88 Bà Triệu, Hà Nội',
        total: 1250000, items: [
            { name: 'Classic Tailored Blazer', qty: 1, price: 1250000, size: 'S', color: '#ffffff', image: 'https://picsum.photos/seed/blazer1/80/80' },
        ],
        status: 'cancelled', date: '23/02/2026', paymentMethod: 'COD',
    },
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
    const [viewingOrder, setViewingOrder] = useState<typeof MOCK_ORDERS[0] | null>(null);

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
        { key: 'items', label: 'SP', render: (item: (typeof MOCK_ORDERS)[0]) => <span>{item.items.length}</span> },
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
            render: (item: (typeof MOCK_ORDERS)[0]) => (
                <button
                    onClick={() => setViewingOrder(item)}
                    className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"
                >
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

            {/* Order Detail Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingOrder(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <Package size={20} className="text-primary" />
                                <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn {viewingOrder.id}</h3>
                            </div>
                            <button onClick={() => setViewingOrder(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5 space-y-6">
                            {/* Status & date */}
                            <div className="flex items-center justify-between">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[viewingOrder.status]}`}>
                                    {STATUS_LABELS[viewingOrder.status]}
                                </span>
                                <span className="text-sm text-gray-500">{viewingOrder.date}</span>
                            </div>

                            {/* Customer info */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Thông tin khách hàng</h4>
                                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                    <p><span className="text-gray-500">Tên:</span> {viewingOrder.customer}</p>
                                    <p><span className="text-gray-500">Email:</span> {viewingOrder.email}</p>
                                    <p><span className="text-gray-500">SĐT:</span> {viewingOrder.phone}</p>
                                    <p><span className="text-gray-500">Thanh toán:</span> {viewingOrder.paymentMethod}</p>
                                </div>
                                <p className="text-sm"><span className="text-gray-500">Địa chỉ:</span> {viewingOrder.address}</p>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sản phẩm ({viewingOrder.items.length})</h4>
                                <div className="space-y-3">
                                    {viewingOrder.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    Size: {item.size} · Màu: <span className="inline-block w-3 h-3 rounded-full border align-middle" style={{ backgroundColor: item.color }} /> · x{item.qty}
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium">{formatVND(item.price * item.qty)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="font-semibold text-gray-700">Tổng cộng</span>
                                <span className="text-lg font-bold text-primary">{formatVND(viewingOrder.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
