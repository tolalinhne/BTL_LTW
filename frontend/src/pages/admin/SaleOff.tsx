import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Tag, Calendar, Percent, Package, X, Check, Clock } from 'lucide-react';
import { adminSaleService, type SaleItem } from '@/services/admin/sale.service';
import { adminProductService } from '@/services/admin/product.service';
import type { Product } from '@/types/user.types';

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    ended: 'bg-red-100 text-red-600',
};

const STATUS_LABELS: Record<string, string> = {
    active: 'Đang diễn ra',
    draft: 'Nháp',
    ended: 'Đã kết thúc',
};

const emptyForm = {
    name: '',
    discountPercent: '',
    couponCode: '',
    startTime: '',
    endTime: '',
    status: 'draft',
    productIds: [] as number[],
};

export default function AdminSaleOff() {
    const [sales, setSales] = useState<SaleItem[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [toast, setToast] = useState('');
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [salesData, productsRes] = await Promise.all([
                adminSaleService.getAll(),
                adminProductService.getAll({ limit: 200 }),
            ]);
            setSales(salesData);
            const items = Array.isArray(productsRes.data)
                ? productsRes.data
                : productsRes.data?.data || [];
            setProducts(items);
        } catch {
            showToast('Lỗi khi tải dữ liệu');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (sale: SaleItem) => {
        setEditingId(sale.id);
        setForm({
            name: sale.name,
            discountPercent: String(sale.discountPercent),
            couponCode: sale.couponCode || '',
            startTime: sale.startTime ? sale.startTime.slice(0, 16) : '',
            endTime: sale.endTime ? sale.endTime.slice(0, 16) : '',
            status: sale.status,
            productIds: [...sale.productIds],
        });
        setShowForm(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload: Partial<SaleItem> = {
                name: form.name,
                discountPercent: Number(form.discountPercent),
                couponCode: form.couponCode || undefined,
                startTime: form.startTime ? form.startTime + ':00' : undefined,
                endTime: form.endTime ? form.endTime + ':00' : undefined,
                status: form.status as 'draft' | 'active' | 'ended',
                productIds: form.productIds,
            };
            if (editingId) {
                await adminSaleService.update(editingId, payload);
                showToast('Cập nhật sale thành công');
            } else {
                await adminSaleService.create(payload);
                showToast('Tạo sale thành công');
            }
            setShowForm(false);
            await fetchData();
        } catch {
            showToast('Lỗi khi lưu sale');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await adminSaleService.delete(deleteId);
            setDeleteId(null);
            showToast('Đã xóa sale');
            await fetchData();
        } catch {
            showToast('Lỗi khi xóa sale');
        }
    };

    const toggleProduct = (id: number) => {
        setForm(prev => ({
            ...prev,
            productIds: prev.productIds.includes(id)
                ? prev.productIds.filter(pid => pid !== id)
                : [...prev.productIds, id],
        }));
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const getSaleStatus = (sale: SaleItem) => {
        if (sale.active) return 'active';
        if (sale.status === 'ended') return 'ended';
        return sale.status;
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Sale</h1>
                    <p className="text-sm text-gray-500 mt-1">{sales.length} chương trình</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-md shadow-brand-primary/20"
                >
                    <Plus size={16} /> Tạo Sale mới
                </button>
            </div>

            {/* Sale List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-400">Đang tải...</div>
                ) : sales.length === 0 ? (
                    <div className="p-12 text-center">
                        <Tag size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">Chưa có chương trình sale nào</p>
                        <p className="text-sm text-gray-400 mt-1">Tạo sale đầu tiên để bắt đầu</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {sales.map((sale) => {
                            const statusKey = getSaleStatus(sale);
                            return (
                                <div key={sale.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[statusKey] || STATUS_STYLES['draft']}`}>
                                                {STATUS_LABELS[statusKey] || 'Nháp'}
                                            </span>
                                            {sale.couponCode && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-accent/10 text-brand-accent text-xs font-mono rounded-full">
                                                    <Tag size={10} /> {sale.couponCode}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-gray-900">{sale.name}</h3>
                                        <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Percent size={12} /> Giảm {sale.discountPercent}%
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package size={12} /> {sale.productIds.length} sản phẩm
                                            </span>
                                            {sale.startTime && (
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} /> Bắt đầu: {new Date(sale.startTime).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                            {sale.endTime && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> Kết thúc: {new Date(sale.endTime).toLocaleDateString('vi-VN')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => openEdit(sale)}
                                            className="p-2 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-brand-accent/10"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteId(sale.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingId ? 'Chỉnh sửa Sale' : 'Tạo Sale mới'}
                            </h3>
                            <button onClick={() => setShowForm(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
                            {/* Tên Sale */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên chương trình *</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="VD: Flash Sale cuối tuần"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                                />
                            </div>

                            {/* Discount + Coupon */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phần trăm giảm (%) *</label>
                                    <input
                                        required
                                        type="number"
                                        min={1}
                                        max={100}
                                        value={form.discountPercent}
                                        onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                                        placeholder="VD: 30"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá (tùy chọn)</label>
                                    <input
                                        value={form.couponCode}
                                        onChange={e => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
                                        placeholder="VD: SALE30"
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                                    />
                                </div>
                            </div>

                            {/* Time Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian bắt đầu</label>
                                    <input
                                        type="datetime-local"
                                        value={form.startTime}
                                        onChange={e => setForm({ ...form, startTime: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian kết thúc</label>
                                    <input
                                        type="datetime-local"
                                        value={form.endTime}
                                        onChange={e => setForm({ ...form, endTime: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm({ ...form, status: e.target.value })}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                                >
                                    <option value="draft">Nháp</option>
                                    <option value="active">Đang diễn ra</option>
                                    <option value="ended">Đã kết thúc</option>
                                </select>
                            </div>

                            {/* Product Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sản phẩm trong sale
                                    <span className="ml-2 text-xs text-brand-accent font-normal">{form.productIds.length} đã chọn</span>
                                </label>
                                <input
                                    value={productSearch}
                                    onChange={e => setProductSearch(e.target.value)}
                                    placeholder="Tìm sản phẩm..."
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                                />
                                <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                                    {filteredProducts.length === 0 ? (
                                        <p className="text-center text-sm text-gray-400 py-6">Không tìm thấy sản phẩm</p>
                                    ) : (
                                        filteredProducts.map(product => {
                                            const selected = form.productIds.includes(Number(product.id));
                                            return (
                                                <div
                                                    key={product.id}
                                                    onClick={() => toggleProduct(Number(product.id))}
                                                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${selected ? 'bg-brand-accent/5' : 'hover:bg-gray-50'}`}
                                                >
                                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${selected ? 'bg-brand-accent border-brand-accent' : 'border-gray-300'}`}>
                                                        {selected && <Check size={12} className="text-white" />}
                                                    </div>
                                                    <img src={product.image || 'https://placehold.co/32'} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                                                        <p className="text-xs text-gray-400">{product.category}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-2.5 text-sm font-medium text-white bg-brand-primary rounded-lg hover:bg-brand-primary/90 disabled:opacity-50"
                                >
                                    {isSaving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo Sale'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-sm text-gray-500 mb-6">Bạn có chắc muốn xóa chương trình sale này?</p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl">Hủy</button>
                            <button onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl">Xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg">
                    {toast}
                </div>
            )}
        </div>
    );
}
