import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

// Mock data (sẽ thay bằng API sau)
const FEATURED_PRODUCTS: Product[] = [
    { id: '1', name: 'Lily Floral Dress', price: 785000, image: 'https://picsum.photos/seed/dress1/600/800', category: 'Dresses', colors: ['#f8d7da', '#d1ecf1', '#fff3cd'], isNew: true },
    { id: '2', name: 'Pastel Blouse', price: 425000, image: 'https://picsum.photos/seed/blouse1/600/800', category: 'Tops', colors: ['#e2e3e5', '#f8d7da'], isBestSeller: true },
    { id: '3', name: 'LiLi Basic Polo', price: 249000, originalPrice: 350000, image: 'https://picsum.photos/seed/polo1/600/800', category: 'Tops', colors: ['#f8d7da', '#ffffff', '#007bff'], isSale: true, discount: 40 },
    { id: '4', name: 'Classic Tailored Blazer', price: 1250000, image: 'https://picsum.photos/seed/blazer1/600/800', category: 'Signature', colors: ['#000000', '#ffffff'] },
    { id: '5', name: 'Garden Bloom Midi Dress', price: 850000, image: 'https://picsum.photos/seed/dress2/600/800', category: 'Dresses', colors: ['#f8d7da'] },
    { id: '6', name: 'Signature Tote Bag', price: 320000, image: 'https://picsum.photos/seed/bag1/600/800', category: 'Accessories', colors: ['#8b4513'] },
];

const CATEGORIES = [
    { name: 'Signature', icon: '✨', slug: 'signature' },
    { name: 'Đầm', icon: '👗', slug: 'dresses' },
    { name: 'Áo', icon: '👕', slug: 'tops' },
    { name: 'Quần', icon: '👖', slug: 'pants' },
    { name: 'Phụ kiện', icon: '👜', slug: 'accessories' },
];

export default function Home() {
    return (
        <div>
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-[#fdfcfb] via-[#f9f5f0] to-[#f0ebe3] overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-accent/10 text-brand-accent rounded-full text-xs font-semibold mb-6">
                                <Sparkles size={14} /> Bộ sưu tập mới 2026
                            </div>
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                Thanh lịch <br />
                                <span className="text-brand-accent">trong từng đường nét</span>
                            </h1>
                            <p className="text-gray-600 text-lg mb-8 max-w-md">
                                Khám phá bộ sưu tập thời trang nữ mới nhất — nơi sự thanh lịch gặp gỡ phong cách đương đại.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/products"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                                >
                                    Khám phá ngay <ArrowRight size={16} />
                                </Link>
                                <Link
                                    to="/products/signature"
                                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-primary text-brand-primary text-sm font-semibold rounded-full hover:bg-brand-primary hover:text-white transition-colors"
                                >
                                    BST Signature
                                </Link>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://picsum.photos/seed/hero-fashion/600/800"
                                    alt="LiLi Fashion Collection"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl">
                                <p className="text-2xl font-bold text-brand-primary">500+</p>
                                <p className="text-xs text-gray-500">Sản phẩm mới</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-center mb-10">Danh mục sản phẩm</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                        {CATEGORIES.map((cat) => (
                            <Link
                                key={cat.slug}
                                to={`/products/${cat.slug}`}
                                className="flex flex-col items-center gap-3 p-6 bg-gray-50 rounded-2xl hover:bg-brand-accent/5 hover:shadow-md transition-all group"
                            >
                                <span className="text-3xl">{cat.icon}</span>
                                <span className="text-sm font-medium text-gray-700 group-hover:text-brand-accent transition-colors">
                                    {cat.name}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="py-16 bg-brand-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
                        <Link to="/products" className="text-sm font-medium text-brand-accent hover:underline flex items-center gap-1">
                            Xem tất cả <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {FEATURED_PRODUCTS.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="py-12 bg-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                                <Truck size={22} />
                            </div>
                            <h4 className="text-sm font-semibold">Miễn phí giao hàng</h4>
                            <p className="text-xs text-gray-500">Đơn hàng từ 500.000đ</p>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                                <RotateCcw size={22} />
                            </div>
                            <h4 className="text-sm font-semibold">Đổi trả 30 ngày</h4>
                            <p className="text-xs text-gray-500">Miễn phí đổi trả toàn quốc</p>
                        </div>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent">
                                <Shield size={22} />
                            </div>
                            <h4 className="text-sm font-semibold">Thanh toán an toàn</h4>
                            <p className="text-xs text-gray-500">Bảo mật SSL 256-bit</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
