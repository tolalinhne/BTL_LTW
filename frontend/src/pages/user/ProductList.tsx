import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, ChevronUp, Star, X } from 'lucide-react';
import ProductCard from '@/components/user/ProductCard';
import { getFeaturedCategories, getAllCategories } from '@/services/categoryData';
import type { Product } from '@/types/user.types';

// Mock data
const ALL_PRODUCTS: Product[] = [
    { id: '1', name: 'Lily Floral Dress', sku: 'LFD-DR-001', price: 785000, image: 'https://picsum.photos/seed/dress1/600/800', category: 'Dresses', colors: ['#f8d7da', '#d1ecf1', '#fff3cd'], stock: 45, soldCount: 150, rating: 4.5, createdAt: '2026-02-20', isNew: true },
    { id: '2', name: 'Pastel Blouse', sku: 'PBL-TP-002', price: 425000, image: 'https://picsum.photos/seed/blouse1/600/800', category: 'Tops', colors: ['#e2e3e5', '#f8d7da'], stock: 120, soldCount: 320, rating: 4.2, createdAt: '2026-01-15', isBestSeller: true },
    { id: '3', name: 'LiLi Basic Polo', sku: 'LBP-TP-003', price: 249000, originalPrice: 350000, image: 'https://picsum.photos/seed/polo1/600/800', category: 'Tops', colors: ['#f8d7da', '#ffffff', '#007bff'], stock: 80, soldCount: 450, rating: 3.8, createdAt: '2026-01-10', isSale: true, discount: 40 },
    { id: '4', name: 'Classic Tailored Blazer', sku: 'CTB-SG-004', price: 1250000, image: 'https://picsum.photos/seed/blazer1/600/800', category: 'Signature', colors: ['#000000', '#ffffff'], stock: 30, soldCount: 85, rating: 4.9, createdAt: '2026-02-01' },
    { id: '5', name: 'Garden Bloom Midi Dress', sku: 'GBM-DR-005', price: 850000, image: 'https://picsum.photos/seed/dress2/600/800', category: 'Dresses', colors: ['#f8d7da'], stock: 18, soldCount: 200, rating: 4.6, createdAt: '2026-02-25', isNew: true },
    { id: '6', name: 'Signature Tote Bag', sku: 'STB-AC-006', price: 320000, image: 'https://picsum.photos/seed/bag1/600/800', category: 'Accessories', colors: ['#8b4513'], stock: 55, soldCount: 180, rating: 4.0, createdAt: '2026-01-20' },
    { id: '7', name: 'Elegant Evening Gown', sku: 'EEG-DR-007', price: 1500000, image: 'https://picsum.photos/seed/gown1/600/800', category: 'Dresses', colors: ['#1a1a1a', '#800020'], stock: 12, soldCount: 60, rating: 4.8, createdAt: '2026-02-28', isNew: true },
    { id: '8', name: 'Casual Cotton Tee', sku: 'CCT-TP-008', price: 195000, image: 'https://picsum.photos/seed/tee1/600/800', category: 'Tops', colors: ['#ffffff', '#f0f0f0', '#d4a574'], stock: 200, soldCount: 520, rating: 3.5, createdAt: '2025-12-15' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá tăng dần' },
    { value: 'price-desc', label: 'Giá giảm dần' },
    { value: 'popular', label: 'Phổ biến nhất' },
];

const PRICE_RANGES = [
    { value: 'all', label: 'Tất cả mức giá' },
    { value: '0-300000', label: 'Dưới 300.000đ' },
    { value: '300000-500000', label: '300.000đ - 500.000đ' },
    { value: '500000-1000000', label: '500.000đ - 1.000.000đ' },
    { value: '1000000-999999999', label: 'Trên 1.000.000đ' },
];

const RATING_OPTIONS = [
    { value: 0, label: 'Tất cả' },
    { value: 4, label: '4 sao trở lên' },
    { value: 3, label: '3 sao trở lên' },
    { value: 2, label: '2 sao trở lên' },
];

const DATE_OPTIONS = [
    { value: 'all', label: 'Tất cả' },
    { value: '7', label: '7 ngày qua' },
    { value: '30', label: '30 ngày qua' },
    { value: '90', label: '3 tháng qua' },
];

export default function ProductList() {
    const { category } = useParams();
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState('all');
    const [minRating, setMinRating] = useState(0);
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBySales, setSortBySales] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const featuredCategories = getFeaturedCategories();
    const allCategories = getAllCategories();
    const displayCategories = showAllCategories ? allCategories : featuredCategories;

    const filteredProducts = useMemo(() => {
        let products = ALL_PRODUCTS;

        // Category filter
        if (category) {
            products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
        }

        // Price range filter
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            products = products.filter((p) => p.price >= min && p.price <= max);
        }

        // Rating filter
        if (minRating > 0) {
            products = products.filter((p) => (p.rating || 0) >= minRating);
        }

        // Date filter
        if (dateFilter !== 'all') {
            const days = Number(dateFilter);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            products = products.filter((p) => p.createdAt && new Date(p.createdAt) >= cutoff);
        }

        // Sort by sales first if enabled
        if (sortBySales) {
            return [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
        }

        // Regular sort
        switch (sortBy) {
            case 'price-asc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...products].sort((a, b) => b.price - a.price);
            case 'popular':
                return [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
            case 'newest':
                return [...products].sort((a, b) => {
                    if (!a.createdAt || !b.createdAt) return 0;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
            default:
                return products;
        }
    }, [category, sortBy, priceRange, minRating, dateFilter, sortBySales]);

    // Find category name for breadcrumb
    const categoryName = category
        ? allCategories.find((c) => c.slug.toLowerCase() === category.toLowerCase())?.name || category
        : null;

    const activeFiltersCount = [
        priceRange !== 'all',
        minRating > 0,
        dateFilter !== 'all',
        sortBySales,
    ].filter(Boolean).length;

    const clearAllFilters = () => {
        setPriceRange('all');
        setMinRating(0);
        setDateFilter('all');
        setSortBySales(false);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Categories */}
            <section className="py-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Danh mục sản phẩm</h2>
                    {allCategories.length > featuredCategories.length && (
                        <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="flex items-center gap-1 text-sm font-medium text-brand-accent hover:underline"
                        >
                            {showAllCategories ? (
                                <><ChevronUp size={14} /> Thu gọn</>
                            ) : (
                                <><ChevronDown size={14} /> Xem tất cả ({allCategories.length})</>
                            )}
                        </button>
                    )}
                </div>
                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${Math.min(displayCategories.length, 6)}, minmax(0, 1fr))` }}
                >
                    {displayCategories.map((cat) => (
                        <Link
                            key={cat.slug}
                            to={`/products/${cat.slug}`}
                            className={`flex flex-col items-center justify-center p-5 rounded-2xl hover:shadow-md transition-all group text-center ${category === cat.slug
                                    ? 'bg-brand-accent/10 shadow-md border border-brand-accent/20'
                                    : 'bg-gray-50 hover:bg-brand-accent/5'
                                }`}
                        >
                            <span className={`text-sm font-medium transition-colors ${category === cat.slug
                                    ? 'text-brand-accent'
                                    : 'text-gray-700 group-hover:text-brand-accent'
                                }`}>
                                {cat.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Breadcrumb — fixed */}
            <nav className="text-sm text-gray-500 mb-6 flex items-center gap-0">
                <Link to="/" className="hover:text-brand-primary transition-colors">Trang chủ</Link>
                <span className="mx-2">/</span>
                {categoryName ? (
                    <>
                        <Link to="/products" className="hover:text-brand-primary transition-colors">Sản phẩm</Link>
                        <span className="mx-2">/</span>
                        <span className="text-brand-primary font-medium">{categoryName}</span>
                    </>
                ) : (
                    <span className="text-brand-primary font-medium">Sản phẩm</span>
                )}
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{categoryName || 'Tất cả sản phẩm'}</h1>
                    <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} sản phẩm</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Filter toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters || activeFiltersCount > 0
                            ? 'border-brand-accent bg-brand-accent/5 text-brand-accent'
                            : 'border-gray-200 text-gray-600 hover:border-brand-accent'
                            }`}
                    >
                        <SlidersHorizontal size={16} />
                        Bộ lọc
                        {activeFiltersCount > 0 && (
                            <span className="w-5 h-5 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => { setSortBy(e.target.value); setSortBySales(false); }}
                            className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className="mb-8 p-5 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-gray-900">Bộ lọc</h3>
                        {activeFiltersCount > 0 && (
                            <button onClick={clearAllFilters} className="text-xs text-brand-accent hover:underline flex items-center gap-1">
                                <X size={12} /> Xóa tất cả
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Price filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Theo giá</label>
                            <select
                                value={priceRange}
                                onChange={(e) => setPriceRange(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                            >
                                {PRICE_RANGES.map((r) => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Rating filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Theo đánh giá</label>
                            <div className="flex flex-wrap gap-2">
                                {RATING_OPTIONS.map((r) => (
                                    <button
                                        key={r.value}
                                        onClick={() => setMinRating(r.value)}
                                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors flex items-center gap-1 ${minRating === r.value
                                            ? 'bg-brand-accent text-white border-brand-accent'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-accent'
                                            }`}
                                    >
                                        {r.value > 0 && <Star size={10} className={minRating === r.value ? 'fill-white' : 'fill-yellow-400 text-yellow-400'} />}
                                        {r.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Date filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Theo ngày đăng</label>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                            >
                                {DATE_OPTIONS.map((d) => (
                                    <option key={d.value} value={d.value}>{d.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Best selling filter */}
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-2">Theo số lượng bán</label>
                            <button
                                onClick={() => setSortBySales(!sortBySales)}
                                className={`w-full px-3 py-2 text-sm rounded-lg border transition-colors ${sortBySales
                                    ? 'bg-brand-accent text-white border-brand-accent'
                                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-brand-accent'
                                    }`}
                            >
                                {sortBySales ? '✓ ' : ''}Bán chạy nhất
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Grid — always grid, no toggle */}
            {filteredProducts.length > 0 ? (
                <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <SlidersHorizontal size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">Không tìm thấy sản phẩm</h3>
                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc danh mục khác</p>
                    {activeFiltersCount > 0 && (
                        <button onClick={clearAllFilters} className="mt-4 px-4 py-2 text-sm text-brand-accent border border-brand-accent rounded-full hover:bg-brand-accent/5">
                            Xóa bộ lọc
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
