import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import { adminCategoryService, type CategoryItem } from '@/services/admin/category.service';

const toSlug = (str: string) =>
    str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

export default function Categories() {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Form state
    const [formName, setFormName] = useState('');
    const [formSlug, setFormSlug] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formIsFeatured, setFormIsFeatured] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
         setIsLoading(true);
         try {
             const res = await adminCategoryService.getAll({ size: 100 });
             if (res.success && res.data) {
                  // Categories API returns flat array (not paginated), so res.data is the array
                  setCategories(Array.isArray(res.data) ? res.data : res.data.data || []);
             }
         } catch(error) {
              console.error("Lỗi khi tải danh mục", error);
         } finally {
              setIsLoading(false);
         }
    };

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
        setFormDescription(cat.description || '');
        setFormIsFeatured(cat.isFeatured);
        setIsModalOpen(true);
    };

    const handleSubmit = async () => {
        if (!formName.trim()) return;
        const slug = formSlug.trim() || toSlug(formName);
        setIsLoading(true);

        try {
             const payload = {
                  name: formName,
                  slug,
                  description: formDescription,
                  isFeatured: formIsFeatured,
             };

            if (editingCategory) {
                 await adminCategoryService.update(editingCategory.id, payload);
            } else {
                 await adminCategoryService.create(payload);
            }
            await fetchCategories();
            setIsModalOpen(false);
        } catch(error: any) {
             console.error("Lỗi khi lưu danh mục", error);
             alert(error.response?.data?.message || "Lỗi khi lưu danh mục");
        } finally {
             setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Bạn có chắc muốn xóa danh mục này?')) {
             setIsLoading(true);
             try {
                  await adminCategoryService.delete(id);
                  await fetchCategories();
             } catch(error: any) {
                  console.error("Lỗi khi xóa danh mục", error);
                  alert(error.response?.data?.message || "Lỗi khi xóa danh mục");
             } finally {
                  setIsLoading(false);
             }
        }
    };

    const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
         try {
              await adminCategoryService.toggleFeatured(id, !currentStatus);
              await fetchCategories();
         } catch(error: any) {
              console.error("Lỗi khi cập nhật trạng thái nổi bật", error);
              alert(error.response?.data?.message || "Lỗi khi cập nhật trạng thái nổi bật");
         }
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
                <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full">
                    {item.productCount || 0}
                </span>
            ),
        },
        {
            key: 'isFeatured',
            label: 'Nổi bật',
            render: (item: CategoryItem) => (
                <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFeatured(item.id, item.isFeatured); }}
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
                    <button onClick={(e) => { e.stopPropagation(); openEdit(item); }} className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-gray-100">
                        <Edit size={16} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50">
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
                        {categories.length} danh mục · {featuredCount} nổi bật
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-md shadow-brand-primary/20"
                >
                    <Plus size={16} /> Thêm danh mục
                </button>
            </div>

            <DataTable columns={columns} data={categories} />
            
            {/* Loading state */}
            {isLoading && categories.length === 0 && (
                 <div className="text-center py-12 text-gray-400">
                     <p className="text-sm">Đang tải dữ liệu...</p>
                 </div>
            )}

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
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary"
                            placeholder="Ví dụ: Đầm, Áo, Quần..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                            value={formSlug}
                            onChange={(e) => setFormSlug(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary bg-gray-50"
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
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary resize-none"
                            placeholder="Mô tả ngắn về danh mục..."
                        />
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="isFeatured"
                            checked={formIsFeatured}
                            onChange={(e) => setFormIsFeatured(e.target.checked)}
                            className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary"
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
