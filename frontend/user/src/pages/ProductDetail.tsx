import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Truck, RotateCcw, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/formatPrice';
import type { Product } from '@/types';

// Mock product (sẽ thay bằng API)
const MOCK_PRODUCT: Product = {
    id: '1',
    name: 'Lily Floral Dress',
    price: 785000,
    image: 'https://picsum.photos/seed/dress1/600/800',
    category: 'Dresses',
    colors: ['#f8d7da', '#d1ecf1', '#fff3cd'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Đầm hoa thanh lịch, thiết kế xòe nhẹ nhàng phù hợp đi làm và dạo phố. Chất liệu vải lụa mềm mịn, thoáng mát.',
    isNew: true,
};

export default function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState(MOCK_PRODUCT.colors[0]);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'desc' | 'review'>('desc');

    const product = MOCK_PRODUCT; // In real app: fetch by id

    const handleAddToCart = () => {
        if (!selectedSize) return alert('Vui lòng chọn size');
        addToCart(product, quantity, selectedSize, selectedColor);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-8">
                <Link to="/" className="hover:text-brand-primary">Trang chủ</Link>
                <ChevronRight size={14} className="mx-2" />
                <Link to="/products" className="hover:text-brand-primary">Sản phẩm</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-brand-primary font-medium truncate">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* Image */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</span>
                        {product.isNew && (
                            <span className="px-2 py-0.5 bg-brand-primary text-white text-[10px] font-bold rounded-full">MỚI</span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>

                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-2xl font-bold text-brand-accent">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                            <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

                    {/* Color selector */}
                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Màu sắc</p>
                        <div className="flex gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? 'border-brand-primary scale-110 shadow-md' : 'border-gray-200'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size selector */}
                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Kích thước</p>
                        <div className="flex gap-2">
                            {(product.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`min-w-[3rem] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                                            ? 'bg-brand-primary text-white border-brand-primary'
                                            : 'border-gray-200 text-gray-600 hover:border-brand-primary'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-8">
                        <p className="text-sm font-medium mb-3">Số lượng</p>
                        <div className="inline-flex items-center border border-gray-200 rounded-lg">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 text-gray-500 hover:text-brand-primary">
                                <Minus size={16} />
                            </button>
                            <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 text-gray-500 hover:text-brand-primary">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-8">
                        <button
                            onClick={handleAddToCart}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                        >
                            <ShoppingBag size={18} /> Thêm vào giỏ
                        </button>
                        <button className="w-14 h-14 border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                            <Heart size={20} />
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Truck size={16} className="text-brand-accent" /> Giao hàng miễn phí
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <RotateCcw size={16} className="text-brand-accent" /> Đổi trả 30 ngày
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
