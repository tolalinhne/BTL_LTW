import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/utils/formatPrice';
import type { Order } from '@/types';

// Mock data
const MOCK_ORDERS: Order[] = [
    {
        id: 'ORD-001',
        items: [
            { productId: '1', productName: 'Lily Floral Dress', productImage: 'https://picsum.photos/seed/dress1/100/120', price: 785000, quantity: 1, size: 'M', color: '#f8d7da' },
            { productId: '2', productName: 'Pastel Blouse', productImage: 'https://picsum.photos/seed/blouse1/100/120', price: 425000, quantity: 2, size: 'S', color: '#e2e3e5' },
        ],
        total: 1635000,
        status: 'shipping',
        shippingAddress: '123 Nguyễn Huệ, Q1, TP.HCM',
        customerName: 'Nguyễn Thị A',
        customerPhone: '0912345678',
        paymentMethod: 'cod',
        createdAt: '2026-02-20T10:30:00Z',
    },
    {
        id: 'ORD-002',
        items: [
            { productId: '4', productName: 'Classic Tailored Blazer', productImage: 'https://picsum.photos/seed/blazer1/100/120', price: 1250000, quantity: 1, size: 'L', color: '#000000' },
        ],
        total: 1250000,
        status: 'delivered',
        shippingAddress: '456 Lê Lợi, Q3, TP.HCM',
        customerName: 'Nguyễn Thị A',
        customerPhone: '0912345678',
        paymentMethod: 'bank',
        createdAt: '2026-02-15T14:00:00Z',
    },
];

const STATUS_CONFIG = {
    pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
    shipping: { label: 'Đang giao', icon: Truck, color: 'text-purple-600 bg-purple-50' },
    delivered: { label: 'Đã giao', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export default function OrderHistory() {
    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-8">Lịch sử đơn hàng</h1>

            {MOCK_ORDERS.length === 0 ? (
                <div className="text-center py-20">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có đơn hàng</h3>
                    <Link to="/products" className="text-sm text-brand-accent hover:underline">
                        Bắt đầu mua sắm →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {MOCK_ORDERS.map((order) => {
                        const status = STATUS_CONFIG[order.status];
                        const StatusIcon = status.icon;
                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-brand-primary">{order.id}</span>
                                        <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${status.color}`}>
                                        <StatusIcon size={12} /> {status.label}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="p-5 space-y-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className="w-14 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-500">Size {item.size} • x{item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">Tổng: <span className="font-semibold text-brand-primary">{formatPrice(order.total)}</span></span>
                                    <button className="flex items-center gap-1 text-sm text-brand-accent hover:underline">
                                        Chi tiết <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
