import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import DataTable from '@/components/DataTable';

const MOCK_PRODUCTS = [
    { id: '1', name: 'Lily Floral Dress', image: 'https://picsum.photos/seed/dress1/50/50', category: 'Dresses', price: 785000, stock: 45, status: 'active' },
    { id: '2', name: 'Pastel Blouse', image: 'https://picsum.photos/seed/blouse1/50/50', category: 'Tops', price: 425000, stock: 120, status: 'active' },
    { id: '3', name: 'LiLi Basic Polo', image: 'https://picsum.photos/seed/polo1/50/50', category: 'Tops', price: 249000, stock: 0, status: 'draft' },
    { id: '4', name: 'Classic Tailored Blazer', image: 'https://picsum.photos/seed/blazer1/50/50', category: 'Signature', price: 1250000, stock: 30, status: 'active' },
    { id: '5', name: 'Garden Bloom Midi Dress', image: 'https://picsum.photos/seed/dress2/50/50', category: 'Dresses', price: 850000, stock: 18, status: 'active' },
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

    const filtered = MOCK_PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
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
                    <button className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Eye size={16} /></button>
                    <button onClick={() => navigate(`/products/${item.id}/edit`)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Edit size={16} /></button>
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
                    onClick={() => navigate('/products/new')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                    <Plus size={16} /> Thêm sản phẩm
                </button>
            </div>

            {/* Search */}
            <div className="relative w-80 mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm sản phẩm..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <DataTable columns={columns} data={filtered} />
        </div>
    );
}
