import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save } from 'lucide-react';

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [form, setForm] = useState({
        name: isNew ? '' : 'Lily Floral Dress',
        category: isNew ? '' : 'Dresses',
        price: isNew ? '' : '785000',
        originalPrice: isNew ? '' : '',
        stock: isNew ? '' : '45',
        description: isNew ? '' : 'Đầm hoa thanh lịch, thiết kế xòe nhẹ nhàng phù hợp đi làm và dạo phố.',
        status: isNew ? 'draft' : 'active',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        navigate('/products');
    };

    return (
        <div>
            <button onClick={() => navigate('/products')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
                <ArrowLeft size={16} /> Quay lại
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {isNew ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}
            </h1>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic info */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Thông tin cơ bản</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                                <input name="name" value={form.name} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                                <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Hình ảnh</h3>
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary/30 transition-colors cursor-pointer">
                            <Upload size={32} className="mx-auto text-gray-300 mb-2" />
                            <p className="text-sm text-gray-500">Kéo thả hoặc click để tải ảnh lên</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (tối đa 5MB)</p>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Giá & Tồn kho</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                                <input name="price" type="number" value={form.price} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá gốc (VNĐ)</label>
                                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tồn kho *</label>
                                <input name="stock" type="number" value={form.stock} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Phân loại</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                <select name="category" value={form.category} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="">Chọn danh mục</option>
                                    <option value="Dresses">Đầm</option>
                                    <option value="Tops">Áo</option>
                                    <option value="Pants">Quần</option>
                                    <option value="Accessories">Phụ kiện</option>
                                    <option value="Signature">Signature</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select name="status" value={form.status} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                                    <option value="active">Đang bán</option>
                                    <option value="draft">Nháp</option>
                                    <option value="archived">Ẩn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                    >
                        <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>
                </div>
            </form>
        </div>
    );
}
