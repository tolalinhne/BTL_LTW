import React, { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DataTable from '@/components/DataTable';
import FormModal from '@/components/FormModal';

const MOCK_CATEGORIES = [
    { id: '1', name: 'Đầm', slug: 'dresses', productCount: 42 },
    { id: '2', name: 'Áo', slug: 'tops', productCount: 86 },
    { id: '3', name: 'Quần', slug: 'pants', productCount: 34 },
    { id: '4', name: 'Phụ kiện', slug: 'accessories', productCount: 28 },
    { id: '5', name: 'Signature', slug: 'signature', productCount: 15 },
];

export default function Categories() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<typeof MOCK_CATEGORIES[0] | null>(null);
    const [formName, setFormName] = useState('');

    const openCreate = () => {
        setEditingCategory(null);
        setFormName('');
        setIsModalOpen(true);
    };

    const openEdit = (cat: typeof MOCK_CATEGORIES[0]) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setIsModalOpen(true);
    };

    const columns = [
        { key: 'name', label: 'Tên danh mục', sortable: true },
        { key: 'slug', label: 'Slug' },
        {
            key: 'productCount',
            label: 'Số sản phẩm',
            sortable: true,
            render: (item: typeof MOCK_CATEGORIES[0]) => (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {item.productCount}
                </span>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (item: typeof MOCK_CATEGORIES[0]) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100">
                        <Edit size={16} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Danh mục</h1>
                    <p className="text-sm text-gray-500 mt-1">{MOCK_CATEGORIES.length} danh mục</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                    <Plus size={16} /> Thêm danh mục
                </button>
            </div>

            <DataTable columns={columns} data={MOCK_CATEGORIES} />

            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                onSubmit={() => setIsModalOpen(false)}
                submitLabel={editingCategory ? 'Cập nhật' : 'Tạo mới'}
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
                    <input
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        placeholder="Nhập tên danh mục..."
                    />
                </div>
            </FormModal>
        </div>
    );
}
