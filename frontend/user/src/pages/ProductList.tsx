import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { SlidersHorizontal, Grid3X3, LayoutList, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

// Mock data
const ALL_PRODUCTS: Product[] = [
    { id: '1', name: 'Lily Floral Dress', price: 785000, image: 'https://picsum.photos/seed/dress1/600/800', category: 'Dresses', colors: ['#f8d7da', '#d1ecf1', '#fff3cd'], isNew: true },
    { id: '2', name: 'Pastel Blouse', price: 425000, image: 'https://picsum.photos/seed/blouse1/600/800', category: 'Tops', colors: ['#e2e3e5', '#f8d7da'], isBestSeller: true },
    { id: '3', name: 'LiLi Basic Polo', price: 249000, originalPrice: 350000, image: 'https://picsum.photos/seed/polo1/600/800', category: 'Tops', colors: ['#f8d7da', '#ffffff', '#007bff'], isSale: true, discount: 40 },
    { id: '4', name: 'Classic Tailored Blazer', price: 1250000, image: 'https://picsum.photos/seed/blazer1/600/800', category: 'Signature', colors: ['#000000', '#ffffff'] },
    { id: '5', name: 'Garden Bloom Midi Dress', price: 850000, image: 'https://picsum.photos/seed/dress2/600/800', category: 'Dresses', colors: ['#f8d7da'] },
    { id: '6', name: 'Signature Tote Bag', price: 320000, image: 'https://picsum.photos/seed/bag1/600/800', category: 'Accessories', colors: ['#8b4513'] },
    { id: '7', name: 'Elegant Evening Gown', price: 1500000, image: 'https://picsum.photos/seed/gown1/600/800', category: 'Dresses', colors: ['#1a1a1a', '#800020'], isNew: true },
    { id: '8', name: 'Casual Cotton Tee', price: 195000, image: 'https://picsum.photos/seed/tee1/600/800', category: 'Tops', colors: ['#ffffff', '#f0f0f0', '#d4a574'] },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'price-asc', label: 'Giá tăng dần' },
    { value: 'price-desc', label: 'Giá giảm dần' },
    { value: 'popular', label: 'Phổ biến nhất' },
];

export default function ProductList() {
    const { category } = useParams();
    const [sortBy, setSortBy] = useState('newest');
    const [gridCols, setGridCols] = useState<3 | 2>(3);

    const filteredProducts = useMemo(() => {
        let products = ALL_PRODUCTS;
        if (category) {
            products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
        }
        switch (sortBy) {
            case 'price-asc':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-desc':
                return [...products].sort((a, b) => b.price - a.price);
            default:
                return products;
        }
    }, [category, sortBy]);

    const pageTitle = category
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : 'Tất cả sản phẩm';

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Breadcrumb */}
            <nav className="text-sm text-gray-500 mb-6">
                <span className="hover:text-brand-primary cursor-pointer">Trang chủ</span>
                <span className="mx-2">/</span>
                <span className="text-brand-primary font-medium">{pageTitle}</span>
            </nav>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{pageTitle}</h1>
                    <p className="text-sm text-gray-500 mt-1">{filteredProducts.length} sản phẩm</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 cursor-pointer"
                        >
                            {SORT_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Grid toggle */}
                    <div className="hidden md:flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setGridCols(3)}
                            className={`p-2 ${gridCols === 3 ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <Grid3X3 size={16} />
                        </button>
                        <button
                            onClick={() => setGridCols(2)}
                            className={`p-2 ${gridCols === 2 ? 'bg-brand-primary text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                            <LayoutList size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
                <div className={`grid gap-6 ${gridCols === 3
                        ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                        : 'grid-cols-1 sm:grid-cols-2'
                    }`}>
                    {filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <SlidersHorizontal size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">Không tìm thấy sản phẩm</h3>
                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi bộ lọc hoặc danh mục khác</p>
                </div>
            )}
        </div>
    );
}
