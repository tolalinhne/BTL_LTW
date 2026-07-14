import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus, Loader2, Trash2, ImagePlus } from 'lucide-react';
import { adminProductService } from '@/services/admin/product.service';
import { uploadService } from '@/services/admin/upload.service';
import api from '@/services/api';

function generateSKU(name: string, category: string): string {
    const nameCode = name.split(' ').map((w) => w.charAt(0).toUpperCase()).slice(0, 3).join('');
    const catMap: Record<string, string> = { Dresses: 'DR', Tops: 'TP', Pants: 'QU', Accessories: 'AC', Signature: 'SG' };
    const catCode = catMap[category] || 'XX';
    return `${nameCode}-${catCode}-${String(Date.now()).slice(-3)}`;
}

interface Variant {
    id?: number;
    size: string;
    color: string;
    colorHex: string;
    stock: number;
    sku: string;
    imageUrl: string;
    uploading?: boolean; // local upload state
}

const DEFAULT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
const COLOR_PRESETS = [
    { name: 'Đen', hex: '#000000' },
    { name: 'Trắng', hex: '#FFFFFF' },
    { name: 'Đỏ', hex: '#E53935' },
    { name: 'Hồng', hex: '#FF69B4' },
    { name: 'Navy', hex: '#1A237E' },
    { name: 'Xanh', hex: '#1E88E5' },
    { name: 'Xanh Lá', hex: '#43A047' },
    { name: 'Be', hex: '#D4B896' },
    { name: 'Nâu', hex: '#795548' },
    { name: 'Xám', hex: '#9E9E9E' },
];

function emptyVariant(): Variant {
    return { size: 'M', color: '', colorHex: '#000000', stock: 1, sku: '', imageUrl: '' };
}

export default function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const [form, setForm] = useState({
        name: '', sku: '', category: '', price: '', originalPrice: '',
        stock: '', shortDescription: '', detailedDescription: '', status: 'active',
    });
    const [variants, setVariants] = useState<Variant[]>([emptyVariant()]);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!isNew);
    const [toast, setToast] = useState('');
    const [categoryList, setCategoryList] = useState<{ name: string; slug: string }[]>([]);

    // One hidden file input per variant (indexed by idx)
    const variantFileRefs = useRef<Record<number, HTMLInputElement | null>>({});

    useEffect(() => {
        api.get('/categories').then(res => {
            const cats = res.data?.data || res.data || [];
            if (Array.isArray(cats)) setCategoryList(cats);
        }).catch(() => {});
    }, []);

    useEffect(() => {
        if (!isNew && id) fetchProductData(id);
    }, [id, isNew, categoryList]);

    const fetchProductData = async (productId: string) => {
        setIsLoading(true);
        try {
            const res = await adminProductService.getById(productId);
            const p: any = res;
            if (!p) throw new Error('Not found');

            let categorySlug = p.categorySlug || p.category || '';
            if (categoryList.length > 0 && categorySlug) {
                const found = categoryList.find(c =>
                    c.slug === categorySlug || c.name === categorySlug || c.name.toLowerCase() === categorySlug.toLowerCase()
                );
                if (found) categorySlug = found.slug;
            }

            setForm({
                name: p.name || '', sku: p.sku || '', category: categorySlug,
                price: p.price?.toString() || '', originalPrice: p.originalPrice?.toString() || '',
                stock: p.stock?.toString() || '',
                shortDescription: p.shortDescription || p.description || '',
                detailedDescription: p.detailedDescription || '',
                status: p.status?.toLowerCase() || 'active',
            });

            if (p.variants && Array.isArray(p.variants) && p.variants.length > 0) {
                setVariants(p.variants.map((v: any) => ({
                    id: v.id, size: v.size || 'M', color: v.color || '',
                    colorHex: v.colorHex || '#000000', stock: v.stock ?? 0,
                    sku: v.sku || '', imageUrl: v.imageUrl || '',
                })));
            }
        } catch (error) {
            console.error('Lỗi khi tải thông tin sản phẩm:', error);
            showToast('Lỗi khi tải thông tin sản phẩm');
        } finally {
            setIsLoading(false);
        }
    };

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

    useEffect(() => {
        if (form.name && form.category && isNew) {
            setForm((prev) => ({ ...prev, sku: generateSKU(prev.name, prev.category) }));
        }
    }, [form.name, form.category, isNew]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ─── Variant helpers ───────────────────────────────────────
    const addVariant = () => setVariants(prev => [...prev, emptyVariant()]);
    const removeVariant = (idx: number) => setVariants(prev => prev.filter((_, i) => i !== idx));
    const updateVariant = (idx: number, field: keyof Variant, value: string | number | boolean) => {
        setVariants(prev => prev.map((v, i) => i === idx ? { ...v, [field]: value } : v));
    };
    const addPresetVariant = (preset: { name: string; hex: string }) => {
        setVariants(prev => [...prev, { ...emptyVariant(), color: preset.name, colorHex: preset.hex }]);
    };

    // Upload ảnh riêng cho từng variant lên Cloudinary
    const handleVariantImageFile = async (idx: number, file: File) => {
        if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
            showToast('File không hợp lệ (ảnh, tối đa 10MB)');
            return;
        }
        updateVariant(idx, 'uploading', true);
        try {
            const result = await uploadService.uploadImage(file, 'products/variants');
            updateVariant(idx, 'imageUrl', result.url);
        } catch (err) {
            console.error('Upload thất bại:', err);
            showToast('Upload ảnh thất bại. Thử lại!');
        } finally {
            updateVariant(idx, 'uploading', false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const variantTotal = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
            // Dùng ảnh của variant đầu tiên có ảnh làm ảnh chính
            const primaryImage = variants.find(v => v.imageUrl)?.imageUrl || null;
            const allVariantImages = variants.filter(v => v.imageUrl).map(v => v.imageUrl);

            const productData = {
                name: form.name, sku: form.sku, categorySlug: form.category,
                price: Number(form.price),
                originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
                stock: Number(form.stock) || variantTotal,
                shortDescription: form.shortDescription,
                detailedDescription: form.detailedDescription,
                status: form.status,
                variants: variants.filter(v => v.color || v.size).map(v => ({
                    id: v.id, size: v.size, color: v.color, colorHex: v.colorHex,
                    stock: v.stock,
                    sku: v.sku || `${form.sku}-${v.color}-${v.size}`,
                    imageUrl: v.imageUrl || null,
                })),
                // Dùng ảnh variant làm gallery ảnh sản phẩm
                imageUrls: allVariantImages.length > 0 ? allVariantImages : [],
                primaryImageUrl: primaryImage,
            };

            if (isNew) {
                await adminProductService.create(productData);
                showToast('Thêm sản phẩm thành công');
            } else if (id) {
                await adminProductService.update(id, productData);
                showToast('Cập nhật sản phẩm thành công');
            }
            setTimeout(() => { navigate('/admin/products'); }, 1000);
        } catch (error) {
            console.error('Lỗi khi lưu sản phẩm:', error);
            showToast('Lỗi khi lưu sản phẩm. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu sản phẩm...</div>;

    const variantTotal = variants.reduce((s, v) => s + (v.stock || 0), 0);

    return (
        <div>
            <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary mb-4 transition-colors">
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
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mã SKU <span className="text-gray-400 font-normal">— tự động</span>
                                    </label>
                                    <input name="sku" value={form.sku} onChange={handleChange} readOnly={!isNew}
                                        className={`w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary ${!isNew ? 'bg-gray-50 text-gray-500' : ''}`} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                                <textarea name="shortDescription" value={form.shortDescription} onChange={handleChange} rows={2}
                                    placeholder="Mô tả ngắn gọn hiển thị ở phần trên trang sản phẩm..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
                                <textarea name="detailedDescription" value={form.detailedDescription} onChange={handleChange} rows={5}
                                    placeholder="Mô tả chi tiết về chất liệu, kiểu dáng, bảo quản,..."
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Variants Table — mỗi variant có upload ảnh riêng */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900">Biến thể (Màu &amp; Size)</h3>
                                <p className="text-xs text-gray-400 mt-0.5">Mỗi hàng = 1 tổ hợp màu + size + tồn kho + ảnh riêng</p>
                            </div>
                            <button type="button" onClick={addVariant}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-primary text-white text-xs font-medium rounded-lg hover:bg-brand-primary/90">
                                <Plus size={14} /> Thêm biến thể
                            </button>
                        </div>

                        <div className="space-y-3 mt-4">
                            {variants.map((v, idx) => (
                                <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    {/* Row 1: color name, hex, size, stock, sku, delete */}
                                    <div className="grid grid-cols-12 gap-2 items-center mb-2">
                                        <div className="col-span-3">
                                            <input
                                                value={v.color}
                                                onChange={e => updateVariant(idx, 'color', e.target.value)}
                                                placeholder="Tên màu (VD: Đỏ)"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent/40"
                                            />
                                        </div>
                                        <div className="col-span-2 flex items-center gap-1">
                                            <input
                                                type="color" value={v.colorHex}
                                                onChange={e => updateVariant(idx, 'colorHex', e.target.value)}
                                                className="w-8 h-8 rounded border border-gray-200 cursor-pointer p-0.5 flex-shrink-0"
                                            />
                                            <span className="text-[10px] text-gray-400 font-mono truncate">{v.colorHex}</span>
                                        </div>
                                        <div className="col-span-2">
                                            <select value={v.size} onChange={e => updateVariant(idx, 'size', e.target.value)}
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent/40">
                                                {DEFAULT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                                {!DEFAULT_SIZES.includes(v.size) && v.size && <option value={v.size}>{v.size}</option>}
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" min={0} value={v.stock}
                                                onChange={e => updateVariant(idx, 'stock', Number(e.target.value))}
                                                placeholder="SL"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-brand-accent/40"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <input value={v.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)}
                                                placeholder="SKU tự động"
                                                className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand-accent/40"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <button type="button" onClick={() => removeVariant(idx)}
                                                disabled={variants.length === 1}
                                                className="p-1.5 text-gray-300 hover:text-red-500 rounded disabled:cursor-not-allowed transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Row 2: image upload area */}
                                    <div className="flex items-center gap-3">
                                        {/* Hidden file input for this variant */}
                                        <input
                                            type="file" accept="image/*"
                                            className="hidden"
                                            ref={el => { variantFileRefs.current[idx] = el; }}
                                            onChange={e => {
                                                const file = e.target.files?.[0];
                                                if (file) handleVariantImageFile(idx, file);
                                                e.target.value = '';
                                            }}
                                        />

                                        {v.imageUrl ? (
                                            /* Preview ảnh đã upload */
                                            <div className="relative flex-shrink-0">
                                                <img src={v.imageUrl} alt=""
                                                    className="w-20 h-20 rounded-lg object-cover border border-gray-200" />
                                                {/* Overlay khi đang upload */}
                                                {v.uploading && (
                                                    <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
                                                        <Loader2 size={18} className="animate-spin text-brand-accent" />
                                                    </div>
                                                )}
                                                <button type="button" onClick={() => updateVariant(idx, 'imageUrl', '')}
                                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow">
                                                    <X size={11} />
                                                </button>
                                                <button type="button"
                                                    onClick={() => variantFileRefs.current[idx]?.click()}
                                                    className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-[9px] rounded py-0.5 text-center">
                                                    Đổi ảnh
                                                </button>
                                            </div>
                                        ) : (
                                            /* Nút upload khi chưa có ảnh */
                                            <button type="button"
                                                onClick={() => variantFileRefs.current[idx]?.click()}
                                                disabled={!!v.uploading}
                                                className="flex flex-col items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 hover:border-brand-primary/40 text-gray-300 hover:text-brand-primary transition-colors disabled:opacity-50">
                                                {v.uploading ? (
                                                    <Loader2 size={20} className="animate-spin text-brand-accent" />
                                                ) : (
                                                    <>
                                                        <ImagePlus size={20} />
                                                        <span className="text-[10px] mt-1">Tải ảnh</span>
                                                    </>
                                                )}
                                            </button>
                                        )}

                                        <div className="text-xs text-gray-400">
                                            <p className="font-medium text-gray-600 mb-0.5">Ảnh biến thể</p>
                                            <p>Màu: <span className="text-gray-700">{v.color || '–'}</span></p>
                                            <p>Size: <span className="text-gray-700">{v.size}</span></p>
                                            <p>Tồn kho: <span className="text-brand-primary font-medium">{v.stock}</span></p>
                                            {v.imageUrl && (
                                                <p className="text-[10px] text-green-500 mt-1">✓ Đã có ảnh</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Color presets */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-[10px] text-gray-400 mb-2 uppercase tracking-wider">Thêm nhanh màu mới:</p>
                            <div className="flex flex-wrap gap-1.5">
                                {COLOR_PRESETS.map(preset => (
                                    <button key={preset.hex} type="button" onClick={() => addPresetVariant(preset)}
                                        className="inline-flex items-center gap-1 px-2 py-1 text-[10px] border border-gray-200 rounded text-gray-500 hover:border-brand-primary hover:text-brand-primary transition-colors">
                                        <span className="w-3 h-3 rounded-full border border-gray-300 inline-block" style={{ backgroundColor: preset.hex }} />
                                        + {preset.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                            <span className="text-gray-400">Tổng tồn kho từ biến thể:</span>
                            <span className="font-bold text-brand-primary">{variantTotal} sản phẩm</span>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Giá & Tồn kho */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Giá &amp; Tồn kho</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Giá bán (VNĐ) *</label>
                                <input name="price" type="number" value={form.price} onChange={handleChange} required
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary" />
                                <p className="text-xs text-gray-400 mt-1">Giá hiển thị cho khách hàng</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Giá nhập (VNĐ) <span className="text-gray-400 font-normal">— nội bộ</span>
                                </label>
                                <input name="originalPrice" type="number" value={form.originalPrice} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary" />
                                <p className="text-xs text-gray-400 mt-1">Không hiển thị ra ngoài</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tồn kho tổng <span className="text-gray-400 font-normal">— hoặc dùng biến thể</span>
                                </label>
                                <input name="stock" type="number" value={form.stock} onChange={handleChange}
                                    placeholder={String(variantTotal || 0)}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary" />
                            </div>
                        </div>
                    </div>

                    {/* Phân loại */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Phân loại</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                                <select name="category" value={form.category} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary">
                                    <option value="">Chọn danh mục</option>
                                    {categoryList.map((cat) => (
                                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                                <select name="status" value={form.status} onChange={handleChange}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-primary">
                                    <option value="active">Đang bán</option>
                                    <option value="draft">Nháp</option>
                                    <option value="archived">Ẩn</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Ảnh preview từ variants */}
                    {variants.some(v => v.imageUrl) && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ảnh sản phẩm (từ biến thể)</h3>
                            <div className="grid grid-cols-3 gap-2">
                                {variants.filter(v => v.imageUrl).map((v, i) => (
                                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                        <img src={v.imageUrl} alt={v.color} className="w-full h-full object-cover" />
                                        {i === 0 && (
                                            <span className="absolute bottom-1 left-1 px-1 py-0.5 bg-brand-primary text-white text-[8px] font-bold rounded">Chính</span>
                                        )}
                                        <div className="absolute top-1 right-1 w-3 h-3 rounded-full border border-white shadow-sm"
                                            style={{ backgroundColor: v.colorHex }} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button type="submit" disabled={isSaving}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-brand-primary text-white font-medium rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50 shadow-md shadow-brand-primary/20">
                        <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu sản phẩm'}
                    </button>

                    {toast && (
                        <div className="px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-lg text-center animate-[fadeIn_0.3s_ease]">
                            {toast}
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
