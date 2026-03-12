import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save, X, Plus } from 'lucide-react';

// Mock product data for editing
const MOCK_PRODUCTS: Record<string, any> = {
    '1': { name: 'Lily Floral Dress', category: 'Dresses', price: '785000', originalPrice: '', stock: '45', shortDescription: 'Đầm hoa thanh lịch, thiết kế xòe nhẹ nhàng phù hợp đi làm và dạo phố.', detailedDescription: 'Chất liệu vải lụa cao cấp, mềm mịn thoáng mát. Kiểu dáng xòe nhẹ tôn dáng, phù hợp nhiều dịp: đi làm, dạo phố, dự tiệc nhẹ. Bảo quản: Giặt tay hoặc giặt máy ở chế độ nhẹ.', status: 'active', colors: ['Hồng nhạt', 'Xanh nhạt', 'Vàng nhạt'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://picsum.photos/seed/dress1/400/500'] },
    '2': { name: 'Pastel Blouse', category: 'Tops', price: '425000', originalPrice: '', stock: '120', shortDescription: 'Áo blouse pastel phong cách Hàn Quốc.', detailedDescription: 'Chất liệu vải chiffon mềm mại, form dáng thoải mái. Thiết kế cổ chữ V thanh lịch, phối cùng chân váy hoặc quần tây đều đẹp.', status: 'active', colors: ['Xám', 'Hồng nhạt'], sizes: ['S', 'M', 'L'], images: ['https://picsum.photos/seed/blouse1/400/500'] },
    '3': { name: 'LiLi Basic Polo', category: 'Tops', price: '249000', originalPrice: '350000', stock: '0', shortDescription: 'Áo polo basic dễ phối đồ.', detailedDescription: 'Áo polo cotton 100%, co giãn nhẹ, thoáng khí. Kiểu dáng basic, dễ phối với quần jeans, chân váy hoặc quần short.', status: 'draft', colors: ['Hồng nhạt', 'Trắng', 'Xanh dương'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://picsum.photos/seed/polo1/400/500'] },
    '4': { name: 'Classic Tailored Blazer', category: 'Signature', price: '1250000', originalPrice: '', stock: '30', shortDescription: 'Blazer may đo cao cấp, form chuẩn.', detailedDescription: 'Blazer Signature được may đo tỉ mỉ từ vải tweed nhập khẩu. Form chuẩn châu Á, tôn dáng. Lớp lót lụa mát, phù hợp công sở và dự tiệc.', status: 'active', colors: ['Đen', 'Trắng'], sizes: ['S', 'M', 'L'], images: ['https://picsum.photos/seed/blazer1/400/500'] },
    '5': { name: 'Garden Bloom Midi Dress', category: 'Dresses', price: '850000', originalPrice: '', stock: '18', shortDescription: 'Đầm midi hoa nhí nữ tính.', detailedDescription: 'Đầm midi họa tiết hoa nhí lãng mạn. Chất liệu vải tơ nhẹ, thoáng mát. Thiết kế eo co giãn, phù hợp nhiều dáng người.', status: 'active', colors: ['Hồng nhạt'], sizes: ['S', 'M', 'L', 'XL'], images: ['https://picsum.photos/seed/dress2/400/500'] },
};

function generateSKU(name: string, category: string): string {
    const nameCode = name
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase())
        .slice(0, 3)
        .join('');
    const catMap: Record<string, string> = {
        Dresses: 'DR', Tops: 'TP', Pants: 'QU', Accessories: 'AC', Signature: 'SG',
    };
    const catCode = catMap[category] || 'XX';
    const num = String(Date.now()).slice(-3);
    return `${nameCode}-${catCode}-${num}`;
}

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load mock data if editing
    const mockData = id ? MOCK_PRODUCTS[id] : null;

    const [form, setForm] = useState({
        name: mockData?.name || '',
        sku: mockData ? generateSKU(mockData.name, mockData.category) : '',
        category: mockData?.category || '',
        price: mockData?.price || '',
        originalPrice: mockData?.originalPrice || '',
        stock: mockData?.stock || '',
        shortDescription: mockData?.shortDescription || '',
        detailedDescription: mockData?.detailedDescription || '',
        status: mockData?.status || 'draft',
    });
    const [colors, setColors] = useState<string[]>(mockData?.colors || []);
    const [sizes, setSizes] = useState<string[]>(mockData?.sizes || []);
    const [newColor, setNewColor] = useState('');
    const [newSize, setNewSize] = useState('');
    const [images, setImages] = useState<{ file?: File; preview: string }[]>(
        mockData?.images ? mockData.images.map((url: string) => ({ preview: url })) : []
    );
    const [isSaving, setIsSaving] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    // Auto-generate SKU when name or category changes
    useEffect(() => {
        if (form.name && form.category) {
            setForm((prev) => ({ ...prev, sku: generateSKU(prev.name, prev.category) }));
        }
    }, [form.name, form.category]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const addColor = () => {
        if (newColor.trim() && !colors.includes(newColor.trim())) {
            setColors([...colors, newColor.trim()]);
            setNewColor('');
        }
    };

    const removeColor = (c: string) => setColors(colors.filter((x) => x !== c));

    const addSize = () => {
        if (newSize.trim() && !sizes.includes(newSize.trim())) {
            setSizes([...sizes, newSize.trim()]);
            setNewSize('');
        }
    };

    const removeSize = (s: string) => setSizes(sizes.filter((x) => x !== s));

    const processFiles = (files: FileList | null) => {
        if (!files) return;
        const newImages = Array.from(files)
            .filter((f) => f.type.startsWith('image/') && f.size <= 5 * 1024 * 1024)
            .map((file) => ({ file, preview: URL.createObjectURL(file) }));
        setImages((prev) => [...prev, ...newImages].slice(0, 6));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        processFiles(e.dataTransfer.files);
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const removed = prev[index];
            if (removed.file) URL.revokeObjectURL(removed.preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        navigate('/admin/products');
    };

    return (
        <div>
            <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
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
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên sản phẩm *</label>
                                    <input name="name" value={form.name} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mã sản phẩm (SKU) <span className="text-gray-400 font-normal">— tự động</span>
                                    </label>
                                    <input name="sku" value={form.sku} readOnly
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 font-mono" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={2}
                                    placeholder="Mô tả ngắn gọn hiển thị ở phần trên trang sản phẩm..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                <textarea name="detailedDescription" value={form.detailedDescription} onChange={handleChange} rows={5}
                                    placeholder="Mô tả chi tiết về chất liệu, kiểu dáng, bảo quản,... hiển thị ở tab 'Mô tả' phía dưới"
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Variants: Colors & Sizes */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Phân loại (Variants)</h3>
                        <div className="space-y-5">
                            {/* Colors */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Màu sắc</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {colors.map((c) => (
                                        <span key={c} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/5 text-primary text-xs font-medium rounded-full">
                                            {c}
                                            <button type="button" onClick={() => removeColor(c)} className="hover:text-danger">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={newColor}
                                        onChange={(e) => setNewColor(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                                        placeholder="Thêm màu (VD: Hồng pastel)"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button type="button" onClick={addColor} className="px-3 py-2 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20">
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Sizes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Kích thước</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {sizes.map((s) => (
                                        <span key={s} className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary/5 text-primary text-xs font-medium rounded-full">
                                            {s}
                                            <button type="button" onClick={() => removeSize(s)} className="hover:text-danger">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        value={newSize}
                                        onChange={(e) => setNewSize(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSize())}
                                        placeholder="Thêm size (VD: XXL, Free Size)"
                                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button type="button" onClick={addSize} className="px-3 py-2 bg-primary/10 text-primary text-sm rounded-lg hover:bg-primary/20">
                                        <Plus size={14} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-1.5 mt-2">
                                    {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map((preset) => (
                                        <button
                                            key={preset}
                                            type="button"
                                            onClick={() => !sizes.includes(preset) && setSizes([...sizes, preset])}
                                            disabled={sizes.includes(preset)}
                                            className="px-2 py-1 text-[10px] border border-gray-200 rounded text-gray-500 hover:border-primary hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            + {preset}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Upload */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Hình ảnh ({images.length}/6)</h3>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" />

                        {images.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                                {images.map((img, i) => (
                                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(i)}
                                            className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={12} />
                                        </button>
                                        {i === 0 && (
                                            <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 bg-primary text-white text-[9px] font-bold rounded">Chính</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {images.length < 6 && (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/30'}`}
                            >
                                <Upload size={32} className={`mx-auto mb-2 ${dragOver ? 'text-primary' : 'text-gray-300'}`} />
                                <p className="text-sm text-gray-500">Kéo thả hoặc click để tải ảnh lên</p>
                                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (tối đa 5MB, tối đa 6 ảnh)</p>
                            </div>
                        )}
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
