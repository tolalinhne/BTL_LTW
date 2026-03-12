import React, { useState } from 'react';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    toggleFeatured,
    MAX_FEATURED,
    type CategoryItem,
} from '@/services/categoryData';

const toSlug = (str: string) =>
    str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

export default function Categories() {
    const [categories, setCategories] = useState<CategoryItem[]>(getAllCategories);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formIsFeatured, setFormIsFeatured] = useState(false);

    const openCreate = () => {
        setEditingCategory(null);
        setFormName('');
        setFormSlug('');
        setFormDescription('');
        setFormIsFeatured(false);
        setIsModalOpen(true);
    };

    const openEdit = (cat: CategoryItem) => {
        setEditingCategory(cat);
        setFormName(cat.name);
        setFormSlug(cat.slug);
        setFormDescription(cat.description);
        setFormIsFeatured(cat.isFeatured);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formName.trim()) return;
        const slug = formSlug.trim() || toSlug(formName);

        if (editingCategory) {
            setCategories(
                updateCategory(editingCategory.id, {
                    name: formName,
                    slug,
                    description: formDescription,
                    isFeatured: formIsFeatured,
                })
            );
        } else {
            setCategories(
                addCategory({
                    name: formName,
                    slug,
                    description: formDescription,
                    isFeatured: formIsFeatured,
                })
            );
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
            setCategories(deleteCategory(id));
        }
    };

    const handleToggleFeatured = (id: string) => {
        setCategories(toggleFeatured(id));
    };

    const featuredCount = categories.filter((c) => c.isFeatured).length;

    const columns = [
        { key: 'name', label: 'Tên danh mục', sortable: true },
        { key: 'slug', label: 'Slug' },
        {
            key: 'description',
            label: 'Mô tả',
            render: (item: CategoryItem) => (
                <span className="text-sm text-gray-500 truncate max-w-[200px] block">{item.description || '—'}</span>
            ),
        },
        {
            key: 'productCount',
            label: 'Số sản phẩm',
            sortable: true,
            render: (item: CategoryItem) => (
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {item.productCount}
                </span>
            ),
        },
        {
            key: 'isFeatured',
            label: 'Nổi bật',
            render: (item: CategoryItem) => (
                <button
                    onClick={() => handleToggleFeatured(item.id)}
                    className={`p-1.5 rounded-lg transition-colors ${item.isFeatured
                        ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                        : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-100'
                        }`}
                    title={item.isFeatured ? 'Bỏ nổi bật' : 'Đặt nổi bật'}
                >
                    <Star size={16} className={item.isFeatured ? 'fill-yellow-400' : ''} />
                </button>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (item: CategoryItem) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50">
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
                    <p className="text-sm text-gray-500 mt-1">
                        {categories.length} danh mục · {featuredCount}/{MAX_FEATURED} nổi bật (hiển thị 1 hàng)
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                    <Plus size={16} /> Thêm danh mục
                </button>
            </div>

            <DataTable columns={columns} data={categories} />

            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}
                onSubmit={handleSubmit}
                submitLabel={editingCategory ? 'Cập nhật' : 'Tạo mới'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục *</label>
                        <input
                            value={formName}
                            onChange={(e) => {
                                setFormName(e.target.value);
                                if (!editingCategory) setFormSlug(toSlug(e.target.value));
                            }}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            placeholder="Ví dụ: Đầm, Áo, Quần..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            value={formSlug}
                            onChange={(e) => setFormSlug(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-gray-50"
                            placeholder="tu-dong-tao-tu-ten"
                        />
                        <p className="text-xs text-gray-400 mt-1">Dùng cho URL, tự động tạo từ tên nếu để trống</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                        <textarea
                            value={formDescription}
                            onChange={(e) => setFormDescription(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                            placeholder="Mô tả ngắn về danh mục..."
                        />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            checked={formIsFeatured}
                            onChange={(e) => setFormIsFeatured(e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                            Danh mục nổi bật <span className="text-gray-400 font-normal">(hiển thị trên trang chủ & sản phẩm)</span>
                        </label>
                    </div>
                </div>
            </FormModal>
        </div>
    );
}
