import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Clock, Truck, CheckCircle, XCircle, X, MapPin, Phone, CreditCard, ShoppingBag } from 'lucide-react';
import { formatPrice, formatDate } from '@/utils/formatPrice';
import api from '@/services/api';
import PaymentQRModal from '@/components/PaymentQRModal';

interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
}

interface Order {
    id: string;
    orderCode?: string;
    items: OrderItem[];
    total: number;
    totalAmount?: number;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    shippingAddress: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    createdAt: string;
    paymentExpiredAt?: string;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    pending: { label: 'Chờ xác nhận', icon: Clock, color: 'text-yellow-600 bg-yellow-50' },
    confirmed: { label: 'Đã xác nhận', icon: CheckCircle, color: 'text-blue-600 bg-blue-50' },
    shipping: { label: 'Đang giao', icon: Truck, color: 'text-purple-600 bg-purple-50' },
    delivered: { label: 'Đã giao', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
    cancelled: { label: 'Đã hủy', icon: XCircle, color: 'text-red-600 bg-red-50' },
};

export default function OrderHistory() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [qrModalOrder, setQrModalOrder] = useState<Order | null>(null);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders', { params: { page: 1, limit: 50 } });
            const data = res.data?.data?.data || res.data?.data?.content || res.data?.data || [];
            setOrders(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error('Failed to fetch orders:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleCancel = async (orderId: string) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;
        setCancelling(true);
        try {
            await api.put(`/orders/${orderId}/cancel`);
            await fetchOrders();
            setSelectedOrder(prev => prev?.id === orderId ? { ...prev, status: 'cancelled' } : prev);
        } catch (e) {
            console.error('Failed to cancel order:', e);
            alert('Không thể hủy đơn hàng. Vui lòng thử lại.');
        } finally {
            setCancelling(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><p className="text-gray-400">Đang tải...</p></div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl font-bold mb-8">Lịch sử đơn hàng</h1>

            {orders.length === 0 ? (
                <div className="text-center py-20">
                    <Package size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">Chưa có đơn hàng</h3>
                    <Link to="/products" className="text-sm text-brand-accent hover:underline">
                        Bắt đầu mua sắm →
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => {
                        const status = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                        const StatusIcon = status.icon;
                        const orderTotal = order.totalAmount || order.total || 0;
                        return (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-semibold text-brand-primary">#{order.orderCode || order.id}</span>
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
                                                <p className="text-xs text-gray-500">{item.size ? `Size ${item.size} • ` : ''}x{item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                                    <span className="text-sm text-gray-500">Tổng: <span className="font-semibold text-brand-primary">{formatPrice(orderTotal)}</span></span>
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="flex items-center gap-1 text-sm text-brand-accent hover:underline"
                                    >
                                        Chi tiết <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <ShoppingBag size={20} className="text-brand-primary" />
                                <h3 className="text-lg font-semibold text-gray-900">Đơn #{selectedOrder.orderCode || selectedOrder.id}</h3>
                            </div>
                            <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto space-y-5">
                            {/* Status */}
                            <div className="flex items-center justify-between">
                                {(() => {
                                    const s = STATUS_CONFIG[selectedOrder.status] || STATUS_CONFIG.pending;
                                    const Icon = s.icon;
                                    return (
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full ${s.color}`}>
                                            <Icon size={14} /> {s.label}
                                        </span>
                                    );
                                })()}
                                <span className="text-xs text-gray-400">{formatDate(selectedOrder.createdAt)}</span>
                            </div>

                            {/* Customer Info */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin giao hàng</h4>
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <Phone size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                                    <span>{selectedOrder.customerName} — {selectedOrder.customerPhone}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <MapPin size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                                    <span>{selectedOrder.shippingAddress}</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <CreditCard size={14} className="mt-0.5 text-gray-400 flex-shrink-0" />
                                    <span>{selectedOrder.paymentMethod || 'COD'}</span>
                                </div>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sản phẩm ({selectedOrder.items.length})</h4>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <img
                                                src={item.productImage || 'https://placehold.co/80'}
                                                alt={item.productName}
                                                className="w-12 h-14 rounded-lg object-cover bg-gray-100"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.size ? `Size ${item.size}` : ''} {item.color ? `• Màu ${item.color}` : ''} • SL: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                                                <p className="text-xs text-gray-400">{formatPrice(item.price)}/sp</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total */}
                            <div className="bg-gray-50 rounded-xl p-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-900">Tổng thanh toán</span>
                                    <span className="text-lg font-bold text-brand-primary">
                                        {formatPrice(selectedOrder.totalAmount || selectedOrder.total || 0)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                {(selectedOrder.status === 'pending') && (
                                    <button
                                        onClick={() => handleCancel(selectedOrder.id)}
                                        disabled={cancelling}
                                        className="flex-1 py-2.5 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                                    >
                                        {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                    </button>
                                )}
                                {(selectedOrder.status === 'pending' && ['bank', 'BANK', 'BANK_TRANSFER'].includes(selectedOrder.paymentMethod)) && (
                                    <button
                                        onClick={() => setQrModalOrder(selectedOrder)}
                                        className="flex-1 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
                                    >
                                        Thanh toán QR
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* QR Payment Modal */}
            {qrModalOrder && (
                <PaymentQRModal
                    orderId={Number(qrModalOrder.id)}
                    orderCode={qrModalOrder.orderCode || `LILI${qrModalOrder.id}`}
                    total={qrModalOrder.totalAmount || qrModalOrder.total || 0}
                    onConfirmed={() => {
                        setQrModalOrder(null);
                        if (selectedOrder) setSelectedOrder({ ...selectedOrder, status: 'confirmed' });
                        fetchOrders();
                    }}
                    onClose={() => setQrModalOrder(null)}
                />
            )}
        </div>
    );
}
