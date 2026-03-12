import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, X, ChevronDown } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';

const MOCK_PRODUCTS = [
    { id: '1', sku: 'LFD-DR-001', name: 'Lily Floral Dress', image: 'https://picsum.photos/seed/dress1/50/50', category: 'Dresses', price: 785000, stock: 45, status: 'active', description: 'Đầm hoa thanh lịch, thiết kế xòe nhẹ nhàng.' },
    { id: '2', sku: 'PBL-TP-002', name: 'Pastel Blouse', image: 'https://picsum.photos/seed/blouse1/50/50', category: 'Tops', price: 425000, stock: 120, status: 'active', description: 'Áo blouse pastel phong cách Hàn Quốc.' },
    { id: '3', sku: 'LBP-TP-003', name: 'LiLi Basic Polo', image: 'https://picsum.photos/seed/polo1/50/50', category: 'Tops', price: 249000, stock: 0, status: 'draft', description: 'Áo polo basic dễ phối đồ.' },
    { id: '4', sku: 'CTB-SG-004', name: 'Classic Tailored Blazer', image: 'https://picsum.photos/seed/blazer1/50/50', category: 'Signature', price: 1250000, stock: 30, status: 'active', description: 'Blazer may đo cao cấp, form chuẩn.' },
    { id: '5', sku: 'GBM-DR-005', name: 'Garden Bloom Midi Dress', image: 'https://picsum.photos/seed/dress2/50/50', category: 'Dresses', price: 850000, stock: 18, status: 'active', description: 'Đầm midi hoa nhí nữ tính.' },
];

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

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function Products() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('Tất cả');
    const [filterStatus, setFilterStatus] = useState('all');
    const [viewingProduct, setViewingProduct] = useState<typeof MOCK_PRODUCTS[0] | null>(null);

    const filtered = MOCK_PRODUCTS.filter((p) => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
        const matchCategory = filterCategory === 'Tất cả' || p.category === filterCategory;
        const matchStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchSearch && matchCategory && matchStatus;
    });

    const columns = [
        {
            key: 'sku',
            label: 'Mã SP',
            render: (item: (typeof MOCK_PRODUCTS)[0]) => (
                <span className="text-xs font-mono text-gray-500 bg-gray-50 px-2 py-1 rounded">{item.sku}</span>
            ),
        },
        {
            key: 'name',
            label: 'Sản phẩm',
            render: (item: (typeof MOCK_PRODUCTS)[0]) => (
                <div className="flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                    <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'price',
            label: 'Giá',
            sortable: true,
            render: (item: (typeof MOCK_PRODUCTS)[0]) => <span className="font-medium">{formatVND(item.price)}</span>,
        },
        {
            key: 'stock',
            label: 'Tồn kho',
            sortable: true,
            render: (item: (typeof MOCK_PRODUCTS)[0]) => (
                <span className={item.stock === 0 ? 'text-red-500 font-medium' : ''}>{item.stock}</span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: (typeof MOCK_PRODUCTS)[0]) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[item.status]}`}>
                    {item.status === 'active' ? 'Đang bán' : item.status === 'draft' ? 'Nháp' : 'Ẩn'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (item: (typeof MOCK_PRODUCTS)[0]) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => setViewingProduct(item)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Eye size={16} /></button>
                    <button onClick={() => navigate(`/admin/products/${item.id}/edit`)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Edit size={16} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">{MOCK_PRODUCTS.length} sản phẩm</p>
                </div>
                <button
                    onClick={() => navigate('/admin/products/new')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                    <Plus size={16} /> Thêm sản phẩm
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative w-80">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm sản phẩm hoặc mã SP..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="relative">
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            <DataTable columns={columns} data={filtered} />

            {/* Product Detail Modal */}
            {viewingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingProduct(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">Chi tiết sản phẩm</h3>
                            <button onClick={() => setViewingProduct(null)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="flex items-center gap-4">
                                <img src={viewingProduct.image.replace('/50/50', '/200/200')} alt={viewingProduct.name}
                                    className="w-24 h-24 rounded-xl object-cover bg-gray-100" />
                                <div>
                                    <h4 className="font-semibold text-gray-900">{viewingProduct.name}</h4>
                                    <p className="text-xs font-mono text-gray-400 mt-0.5">{viewingProduct.sku}</p>
                                    <p className="text-sm text-gray-500">{viewingProduct.category}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_STYLES[viewingProduct.status]}`}>
                                        {viewingProduct.status === 'active' ? 'Đang bán' : viewingProduct.status === 'draft' ? 'Nháp' : 'Ẩn'}
                                    </span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500">Giá bán</p>
                                    <p className="font-semibold">{formatVND(viewingProduct.price)}</p>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500">Tồn kho</p>
                                    <p className={`font-semibold ${viewingProduct.stock === 0 ? 'text-red-500' : ''}`}>{viewingProduct.stock}</p>
                                </div>
                            </div>
                            {viewingProduct.description && (
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">Mô tả</p>
                                    <p className="text-sm text-gray-700">{viewingProduct.description}</p>
                                </div>
                            )}
                            <button
                                onClick={() => { setViewingProduct(null); navigate(`/admin/products/${viewingProduct.id}/edit`); }}
                                className="w-full py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
                            >
                                Chỉnh sửa sản phẩm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
