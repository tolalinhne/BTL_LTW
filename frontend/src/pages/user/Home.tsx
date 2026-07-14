import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import ProductCard from '@/components/user/ProductCard';
import api from '@/services/api';
import type { Product } from '@/types/user.types';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
    productCount: number;
    isFeatured?: boolean;
    is_featured?: boolean;
}

export default function Home() {
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    // Lấy sản phẩm nổi bật (isBestSeller = true)
                    api.get('/products/featured', { params: { limit: 8 } }),
                    api.get('/categories'),
                ]);

                // /api/products/featured trả về List trực tiếp (không phân trang)
                const prodData = prodRes.data?.data || [];
                setFeaturedProducts(Array.isArray(prodData) ? prodData : []);

                const catData = catRes.data?.data || [];
                const cats: CategoryItem[] = Array.isArray(catData) ? catData : [];

                // Đẩy Signature lên đầu danh sách
                const signatureIdx = cats.findIndex(
                    (c) => c.slug === 'signature' || c.name?.toLowerCase() === 'signature'
                );
                if (signatureIdx > 0) {
                    const [sig] = cats.splice(signatureIdx, 1);
                    cats.unshift(sig);
                }

                setCategories(cats);
            } catch (e) {
                console.error('Failed to fetch home data:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const featuredCategories = categories.filter((c) => c.isFeatured || c.is_featured);
    // Khi thu gọn: ưu tiên hiển thị các featured category (hoặc 6 cái đầu); Signature luôn đứng đầu
    const displayCategories = showAllCategories
        ? categories
        : featuredCategories.length > 0
            ? featuredCategories
            : categories.slice(0, 6);

    const gridCols = Math.min(displayCategories.length || 1, 6);

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
                                {/* Nút BST Signature → trang danh mục Signature */}
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

            {/* Categories — Signature cố định đầu tiên */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
                        {categories.length > (featuredCategories.length || 6) && (
                            <button
                                onClick={() => setShowAllCategories(!showAllCategories)}
                                className="flex items-center gap-1.5 text-sm font-medium text-brand-accent hover:underline"
                            >
                                {showAllCategories ? (
                                    <><ChevronUp size={14} /> Thu gọn</>
                                ) : (
                                    <><ChevronDown size={14} /> Xem tất cả ({categories.length})</>
                                )}
                            </button>
                        )}
                    </div>

                    <div
                        className="grid gap-4"
                        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                    >
                        {displayCategories.map((cat: CategoryItem) => (
                            <Link
                                key={cat.slug}
                                to={`/products/${cat.slug}`}
                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl transition-all group text-center
                                    ${cat.slug === 'signature' || cat.name?.toLowerCase() === 'signature'
                                        ? 'bg-brand-accent/10 border border-brand-accent/30 hover:bg-brand-accent/20'
                                        : 'bg-gray-50 hover:bg-brand-accent/5 hover:shadow-md'
                                    }`}
                            >
                                <span className={`text-sm font-medium transition-colors
                                    ${cat.slug === 'signature' || cat.name?.toLowerCase() === 'signature'
                                        ? 'text-brand-accent font-semibold'
                                        : 'text-gray-700 group-hover:text-brand-accent'
                                    }`}>
                                    {cat.name}
                                    {(cat.slug === 'signature' || cat.name?.toLowerCase() === 'signature') && (
                                        <span className="ml-1.5 inline-flex items-center gap-0.5 text-[10px] bg-brand-accent text-white px-1.5 py-0.5 rounded-full">
                                            <Sparkles size={9} /> Nổi bật
                                        </span>
                                    )}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products — isBestSeller = true */}
            <section className="py-16 bg-brand-bg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
                            <p className="text-sm text-gray-500 mt-1">Được admin đánh dấu nổi bật</p>
                        </div>
                        <Link to="/products/signature" className="text-sm font-medium text-brand-accent hover:underline flex items-center gap-1">
                            Xem tất cả <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {loading ? (
                            <p className="col-span-full text-center text-gray-400 py-12">Đang tải...</p>
                        ) : featuredProducts.length > 0 ? (
                            featuredProducts.map((product: Product) => (
                                <ProductCard key={product.id} product={product} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16">
                                <p className="text-gray-400 mb-2">Chưa có sản phẩm nổi bật</p>
                                <p className="text-xs text-gray-300">Admin có thể đánh dấu sản phẩm nổi bật trong trang quản lý</p>
                            </div>
                        )}
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
