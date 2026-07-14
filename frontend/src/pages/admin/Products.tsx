import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, X, ChevronDown, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import { adminProductService } from '@/services/admin/product.service';
import type { Product } from '@/types/user.types';

const CATEGORIES = ['Tất cả', 'Dresses', 'Tops', 'Pants', 'Accessories', 'Signature'];
const STATUS_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Đang bán' },
    { value: 'draft', label: 'Nháp' },
    { value: 'archived', label: 'Ẩn' },
];

const STATUS_STYLES: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    draft: 'bg-gray-100 text-gray-600',
    archived: 'bg-red-100 text-red-600',
};

const formatVND = (n: number | undefined) => {
    if (n === undefined) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
};

const PAGE_SIZE = 12;

export default function Products() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('Tất cả');
    const [filterStatus, setFilterStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
    const [toast, setToast] = useState('');
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const res = await adminProductService.getAll({ limit: 100 });
            if (res.success && res.data) {
                // PagedResponse has .data array inside
                const items: any[] = Array.isArray(res.data) ? res.data : res.data.data || [];
                // Tổng hợp stock từ variants nếu stock chưa có
                const normalized = items.map((p: any) => ({
                    ...p,
                    stock: p.stock !== undefined && p.stock !== null
                        ? p.stock
                        : (p.variants?.reduce((sum: number, v: any) => sum + (v.stock || 0), 0) ?? 0),
                }));
                setProducts(normalized);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách sản phẩm:", error);
            showToast('Lỗi khi tải danh sách sản phẩm');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (deleteId) {
            try {
                await adminProductService.delete(deleteId);
                setDeleteId(null);
                await fetchProducts();
                showToast('Đã xóa sản phẩm thành công');
            } catch (error) {
                console.error("Lỗi khi xóa sản phẩm:", error);
                showToast('Lỗi khi xóa sản phẩm');
            }
        }
    };

    const handleToggleFeatured = async (item: Product) => {
        try {
            await adminProductService.toggleFeatured(item.id);
            // Optimistic update in the list
            setProducts(prev => prev.map(p =>
                p.id === item.id ? { ...p, isBestSeller: !(p as any).isBestSeller } as any : p
            ));
            showToast((item as any).isBestSeller ? 'Đã bỏ nổi bật' : 'Đã đánh dấu nổi bật');
        } catch {
            showToast('Lỗi khi cập nhật trạng thái nổi bật');
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const filtered = products.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()));
        const matchCategory = filterCategory === 'Tất cả' || p.category === filterCategory;
        const status = (p as any).status || 'active';
        const matchStatus = filterStatus === 'all' || status === filterStatus;
        return matchSearch && matchCategory && matchStatus;
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

    const handleFilterChange = (setter: (v: any) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setter(e.target.value);
        setCurrentPage(1);
    };

    const columns = [
        {
            key: 'sku',
            label: 'Mã SP',
            render: (item: Product) => (
                <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{item.sku || 'N/A'}</span>
            ),
        },
        {
            key: 'name',
            label: 'Sản phẩm',
            render: (item: Product) => (
                <div className="flex items-center gap-3">
                    <img src={item.image || 'https://placehold.co/50'} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0" />
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="font-medium text-gray-900 truncate max-w-[180px]">{item.name}</p>
                            {(item as any).isBestSeller && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-100 text-amber-600 text-[10px] font-semibold rounded-full flex-shrink-0">
                                    <Star size={9} fill="currentColor" /> Nổi bật
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{item.category}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'price',
            label: 'Giá',
            sortable: true,
            render: (item: Product) => <span className="font-medium">{formatVND(item.price)}</span>,
        },
        {
            key: 'stock',
            label: 'Tồn kho',
            sortable: true,
            render: (item: any) => {
                const stock = item.stock || 0;
                return <span className={stock === 0 ? 'text-red-500 font-medium' : ''}>{stock}</span>;
            }
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: any) => {
                const status = item.status || 'active';
                 return (
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[status] || STATUS_STYLES['active']}`}>
                        {status === 'active' ? 'Đang bán' : status === 'draft' ? 'Nháp' : 'Ẩn'}
                    </span>
                 );
            }
        },
        {
            key: 'actions',
            label: '',
            render: (item: Product) => (
                <div className="flex items-center gap-1 justify-end">
                    <button
                        onClick={() => handleToggleFeatured(item)}
                        title={(item as any).isBestSeller ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                        className={`p-1.5 rounded-lg transition-colors ${
                            (item as any).isBestSeller
                                ? 'text-amber-400 bg-amber-50 hover:bg-amber-100'
                                : 'text-gray-300 hover:text-amber-400 hover:bg-amber-50'
                        }`}
                    >
                        <Star size={16} fill={(item as any).isBestSeller ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => setViewingProduct(item)} className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-brand-accent/10"><Eye size={16} /></button>
                    <button onClick={() => navigate(`/admin/products/${item.id}/edit`)} className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-brand-accent/10"><Edit size={16} /></button>
                    <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">{filtered.length} sản phẩm</p>
                </div>
                <button
                    onClick={() => navigate('/admin/products/new')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-md shadow-brand-primary/20"
                >
                    <Plus size={16} /> Thêm sản phẩm
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        placeholder="Tìm sản phẩm hoặc mã SP..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterCategory}
                        onChange={handleFilterChange(setFilterCategory)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary cursor-pointer"
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>{cat === 'Tất cả' ? 'Tất cả danh mục' : cat}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                    <select
                        value={filterStatus}
                        onChange={handleFilterChange(setFilterStatus)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                        Hiển thị {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} / {filtered.length} sản phẩm
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

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-sm text-gray-500 mb-6">Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-sm transition-colors"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Detail Modal */}
            {viewingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingProduct(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-lg font-semibold text-gray-900">Chi tiết sản phẩm</h3>
                            <button onClick={() => setViewingProduct(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-5 overflow-y-auto custom-scrollbar space-y-4">
                            <div className="flex items-start sm:items-center gap-4 flex-col sm:flex-row">
                                <img src={viewingProduct.image || 'https://placehold.co/200'} alt={viewingProduct.name}
                                    className="w-24 h-24 rounded-xl object-cover bg-gray-100 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">{viewingProduct.name}</h4>
                                    <p className="text-xs font-mono text-gray-400 mt-0.5">{viewingProduct.sku || 'N/A'}</p>
                                    <p className="text-sm text-gray-500 mt-1">{viewingProduct.category}</p>
                                    <span className={`inline-block mt-2 px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[(viewingProduct as any).status || 'active']}`}>
                                        {((viewingProduct as any).status || 'active') === 'active' ? 'Đang bán' : ((viewingProduct as any).status || 'active') === 'draft' ? 'Nháp' : 'Ẩn'}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 mb-1">Giá bán</p>
                                    <p className="font-semibold">{formatVND(viewingProduct.price)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500 mb-1">Tồn kho</p>
                                    <p className={`font-semibold ${(viewingProduct as any).stock === 0 ? 'text-red-500' : ''}`}>{(viewingProduct as any).stock || 0}</p>
                                </div>
                            </div>
                            {(viewingProduct as any).description && (
                                <div className="pt-2">
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Mô tả</p>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl">{(viewingProduct as any).description}</p>
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-100 mt-4">
                                <button
                                    onClick={() => { setViewingProduct(null); navigate(`/admin/products/${viewingProduct.id}/edit`); }}
                                    className="w-full py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors"
                                >
                                    Chỉnh sửa sản phẩm
                                </button>
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
