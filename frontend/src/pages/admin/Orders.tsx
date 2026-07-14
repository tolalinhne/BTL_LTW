import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronDown, X, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import { adminOrderService } from '@/services/admin/order.service';
import type { Order } from '@/types/shared.types';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-orange-100 text-orange-700',
    shipping: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
    refunded: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
    pending: 'Chờ xác nhận',
    processing: 'Đang xử lý',
    confirmed: 'Đã xác nhận',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    refunded: 'Đã hoàn tiền',
};

const formatVND = (n: number | undefined) => {
    if (n === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

const PAGE_SIZE = 12;

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await adminOrderService.getAll({ limit: 100 });
            const items = res?.data || res?.content || res || [];
            setOrders(Array.isArray(items) ? items : []);
        } catch (error) {
            console.error("Lỗi khi tải danh sách đơn hàng:", error);
            showToast('Lỗi khi tải danh sách đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
        setIsUpdatingStatus(true);
        try {
            await adminOrderService.updateStatus(orderId, newStatus);
            showToast('Cập nhật trạng thái thành công');
            // Optimistic update
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
            if (viewingOrder?.id === orderId) {
                setViewingOrder(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            console.error("Lỗi khi cập nhật trạng thái:", error);
            showToast('Lỗi khi cập nhật trạng thái');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const filtered = orders.filter((o) => {
        const name = (o as any).customerName || 'Khách Vãng Lai';
        const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || o.id.toString().toLowerCase().includes(search.toLowerCase());
        const matchStatus = filterStatus === 'all' || o.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const columns = [
        { key: 'id', label: 'Mã đơn', sortable: true },
        {
            key: 'customer',
            label: 'Khách hàng',
            render: (item: any) => (
                <div>
                    <p className="font-medium text-gray-900">{item.customerName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{item.customerPhone}</p>
                </div>
            ),
        },
        { key: 'items', label: 'SP', render: (item: Order) => <span>{item.items?.length || 0}</span> },
        {
            key: 'total',
            label: 'Tổng tiền',
            sortable: true,
            render: (item: Order) => <span className="font-medium">{formatVND(item.totalAmount)}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: Order) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[item.status] || 'bg-gray-100 text-gray-700'}`}>
                    {STATUS_LABELS[item.status] || item.status}
                </span>
            ),
        },
        { 
            key: 'date', 
            label: 'Ngày', 
            sortable: true,
            render: (item: Order) => <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
        },
        {
            key: 'actions',
            label: '',
            render: (item: Order) => (
                <button
                    onClick={() => setViewingOrder(item)}
                    className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-gray-100"
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
                    <p className="text-sm text-gray-500 mt-1">{filtered.length} đơn hàng</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Tìm đơn hàng, khách hàng..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary cursor-pointer"
                    >
                        <option value="all">Tất cả trạng thái</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>
                ) : (
                    <DataTable columns={columns} data={paginated} />
                )}
            </div>

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-1">
                    <p className="text-sm text-gray-500">
                        Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} đơn hàng
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(p => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                            .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                                if (idx > 0 && (arr[idx - 1] as number) < p - 1) acc.push('...');
                                acc.push(p);
                                return acc;
                            }, [])
                            .map((p, i) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-gray-400 text-sm">…</span>
                                ) : (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p as number)}
                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                            safePage === p
                                                ? 'bg-brand-primary text-white shadow-sm'
                                                : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                )
                            )
                        }
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {viewingOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingOrder(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <Package size={20} className="text-brand-primary" />
                                <h3 className="text-lg font-semibold text-gray-900">Chi tiết đơn {viewingOrder.id}</h3>
                            </div>
                            <button onClick={() => setViewingOrder(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-6 py-5 overflow-y-auto custom-scrollbar space-y-6">
                            {/* Status & date */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${STATUS_STYLES[viewingOrder.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {STATUS_LABELS[viewingOrder.status] || viewingOrder.status}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        Ngày đặt: {new Date(viewingOrder.createdAt).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">Cập nhật:</span>
                                    <select
                                        value={viewingOrder.status}
                                        onChange={(e) => handleUpdateStatus(viewingOrder.id, e.target.value as Order['status'])}
                                        disabled={isUpdatingStatus || ['cancelled', 'refunded'].includes(viewingOrder.status)}
                                        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary disabled:opacity-50"
                                    >
                                        <option value={viewingOrder.status}>{STATUS_LABELS[viewingOrder.status]}</option>
                                        {viewingOrder.status === 'pending' && (
                                            <>
                                                <option value="processing">Đang xử lý</option>
                                                <option value="confirmed">Đã xác nhận</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </>
                                        )}
                                        {viewingOrder.status === 'processing' && (
                                            <>
                                                <option value="confirmed">Đã xác nhận</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </>
                                        )}
                                        {viewingOrder.status === 'confirmed' && (
                                            <>
                                                <option value="shipping">Đang giao</option>
                                                <option value="cancelled">Đã hủy</option>
                                            </>
                                        )}
                                        {viewingOrder.status === 'shipping' && (
                                            <option value="delivered">Đã giao</option>
                                        )}
                                        {viewingOrder.status === 'delivered' && (
                                            <option value="refunded">Đã hoàn tiền</option>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Customer info */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <h4 className="text-sm font-semibold text-gray-700">Thông tin khách hàng & Giao hàng</h4>
                                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                                    <p><span className="text-gray-500">Tên:</span> {(viewingOrder as any).customerName}</p>
                                    <p><span className="text-gray-500">SĐT:</span> {(viewingOrder as any).customerPhone}</p>
                                    <p><span className="text-gray-500">Thanh toán:</span> {viewingOrder.paymentMethod}</p>
                                    <p><span className="text-gray-500">Ghi chú:</span> {viewingOrder.note || 'Không'}</p>
                                </div>
                                <p className="text-sm"><span className="text-gray-500">Địa chỉ:</span> {(viewingOrder as any).shippingAddress}</p>
                            </div>

                            {/* Items */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">Sản phẩm ({viewingOrder.items?.length || 0})</h4>
                                <div className="space-y-3">
                                    {viewingOrder.items?.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                            <img src={item.image || 'https://placehold.co/80'} alt={item.productName} className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{item.productName}</p>
                                                <p className="text-xs text-gray-500">
                                                    Size: {item.size} · Màu: <span className="inline-block w-3 h-3 rounded-full border align-middle bg-gray-200" title={item.color} /> · SL: {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium">{formatVND(item.price * item.quantity)}</p>
                                                <p className="text-xs text-gray-500">{formatVND(item.price)} / sp</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Tổng phụ</span>
                                    <span>{formatVND(viewingOrder.subTotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Phí giao hàng</span>
                                    <span>{formatVND(viewingOrder.shippingFee)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Giảm giá</span>
                                    <span className="text-red-500">-{formatVND(viewingOrder.discountAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-200">
                                    <span className="font-semibold text-gray-900">Tổng thanh toán</span>
                                    <span className="text-lg font-bold text-brand-primary">{formatVND(viewingOrder.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg animate-[fadeIn_0.3s_ease]">
                    {toast}
                </div>
            )}
        </div>
    );
}
