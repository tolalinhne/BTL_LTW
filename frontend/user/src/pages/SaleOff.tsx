import React, { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import type { Product } from '@/types';

// Mock sale products
const SALE_PRODUCTS: Product[] = [
    { id: 's1', name: 'LiLi Basic Polo', price: 249000, originalPrice: 350000, image: 'https://picsum.photos/seed/polo1/600/800', category: 'Tops', colors: ['#f8d7da', '#ffffff', '#007bff'], isSale: true, discount: 40 },
    { id: 's2', name: 'Summer Floral Dress', price: 520000, originalPrice: 850000, image: 'https://picsum.photos/seed/sdress1/600/800', category: 'Dresses', colors: ['#f8d7da'], isSale: true, discount: 35 },
    { id: 's3', name: 'Classic Linen Pants', price: 380000, originalPrice: 580000, image: 'https://picsum.photos/seed/pants1/600/800', category: 'Pants', colors: ['#d4a574', '#1a1a1a'], isSale: true, discount: 30 },
    { id: 's4', name: 'Elegant Silk Blouse', price: 450000, originalPrice: 750000, image: 'https://picsum.photos/seed/silk1/600/800', category: 'Tops', colors: ['#ffffff', '#e2e3e5'], isSale: true, discount: 40 },
    { id: 's5', name: 'Boho Maxi Skirt', price: 320000, originalPrice: 520000, image: 'https://picsum.photos/seed/skirt1/600/800', category: 'Dresses', colors: ['#f0e68c'], isSale: true, discount: 38 },
    { id: 's6', name: 'Signature Tote Bag', price: 220000, originalPrice: 320000, image: 'https://picsum.photos/seed/bag1/600/800', category: 'Accessories', colors: ['#8b4513'], isSale: true, discount: 30 },
    { id: 's7', name: 'Wide Leg Trousers', price: 290000, originalPrice: 480000, image: 'https://picsum.photos/seed/trousers1/600/800', category: 'Pants', colors: ['#1a1a1a', '#f5f5dc'], isSale: true, discount: 40 },
    { id: 's8', name: 'Pearl Earrings Set', price: 150000, originalPrice: 250000, image: 'https://picsum.photos/seed/earring1/600/800', category: 'Accessories', colors: ['#ffd700'], isSale: true, discount: 40 },
];

// Tab config: label, slug (for URL), category filter
const SALE_TABS: { label: string; slug: string | null; category: string | null }[] = [
    { label: 'Tất cả Sale', slug: null, category: null },
    { label: 'Váy Sale', slug: 'dresses', category: 'Dresses' },
    { label: 'Áo Sale', slug: 'tops', category: 'Tops' },
    { label: 'Quần Sale', slug: 'pants', category: 'Pants' },
    { label: 'Phụ kiện Sale', slug: 'accessories', category: 'Accessories' },
];

const DISCOUNT_RANGES = [
    { label: '10-30%', min: 10, max: 30 },
    { label: '30-50%', min: 30, max: 50 },
    { label: '50%+', min: 50, max: 100 },
];

const SIZES = ['S', 'M', 'L', 'XL'];

export default function SaleOff() {
    const { category } = useParams<{ category?: string }>();
    const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 14, seconds: 35 });
    const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

    // Dynamic price bounds from actual products
    const minPrice = useMemo(() => Math.min(...SALE_PRODUCTS.map((p) => p.price)), []);
    const maxPrice = useMemo(() => Math.max(...SALE_PRODUCTS.map((p) => p.price)), []);
    const [priceRange, setPriceRange] = useState(maxPrice);

    // Reset price range when maxPrice changes
    useEffect(() => { setPriceRange(maxPrice); }, [maxPrice]);

    // Active tab index from URL param
    const activeTabIdx = useMemo(() => {
        if (!category) return 0;
        const idx = SALE_TABS.findIndex((t) => t.slug === category);
        return idx >= 0 ? idx : 0;
    }, [category]);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
                if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
                if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
                return prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleDiscount = (idx: number) => {
        setSelectedDiscounts((prev) =>
            prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
        );
    };

    const toggleSize = (size: string) => {
        setSelectedSizes((prev) =>
            prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
        );
    };

    const filteredProducts = useMemo(() => {
        let products = SALE_PRODUCTS;

        // Filter by category (from URL)
        const tabCategory = SALE_TABS[activeTabIdx].category;
        if (tabCategory) {
            products = products.filter((p) => p.category === tabCategory);
        }

        // Filter by discount range
        if (selectedDiscounts.length > 0) {
            products = products.filter((p) => {
                const d = p.discount || 0;
                return selectedDiscounts.some((idx) => {
                    const range = DISCOUNT_RANGES[idx];
                    return d >= range.min && d <= range.max;
                });
            });
        }

        // Filter by price
        products = products.filter((p) => p.price <= priceRange);

        return products;
    }, [activeTabIdx, selectedDiscounts, priceRange]);

    const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

    return (
        <div className="pb-20">
            {/* Sale Banner */}
            <section className="relative h-[60vh] overflow-hidden">
                <img
                    src="https://picsum.photos/seed/salebanner/1920/1080"
                    alt="Sale Banner"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-white text-center px-4">
                    <p className="text-sm font-medium uppercase tracking-[0.3em] mb-4">End of Season</p>
                    <h1 className="text-7xl md:text-9xl font-serif mb-4 tracking-tighter">SALE</h1>
                    <div className="flex items-center gap-4 text-2xl md:text-4xl font-serif">
                        <span>UP TO</span>
                        <span className="text-6xl md:text-8xl font-bold">50%</span>
                        <span>OFF</span>
                    </div>
                </div>
            </section>

            {/* Tabs — URL-based navigation */}
            <div className="max-w-7xl mx-auto px-4 py-8 border-b border-black/5">
                <div className="flex items-center justify-center gap-8 overflow-x-auto hide-scrollbar">
                    {SALE_TABS.map((tab, idx) => (
                        <Link
                            key={tab.label}
                            to={tab.slug ? `/saleoff/${tab.slug}` : '/saleoff'}
                            className={`text-sm font-bold uppercase tracking-widest pb-2 border-b-2 transition-all whitespace-nowrap ${idx === activeTabIdx ? 'text-red-500 border-red-500' : 'text-gray-400 border-transparent hover:text-brand-primary'
                                }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Flash Sale Countdown */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
                    <h2 className="text-2xl font-serif font-bold text-red-500 uppercase tracking-widest">Flash Sale kết thúc trong:</h2>
                    <div className="flex gap-4">
                        {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((unit, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-black text-white rounded-sm flex items-center justify-center text-2xl font-bold">
                                    {unit.toString().padStart(2, '0')}
                                </div>
                                {idx < 2 && <span className="text-2xl font-bold">:</span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block space-y-12">
                        {/* Discount filter */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center justify-between">
                                Mức giảm <ChevronDown size={16} />
                            </h3>
                            <div className="space-y-4">
                                {DISCOUNT_RANGES.map((range, idx) => (
                                    <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedDiscounts.includes(idx)}
                                            onChange={() => toggleDiscount(idx)}
                                            className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
                                        />
                                        <span className="text-sm text-gray-500 group-hover:text-brand-primary">{range.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price filter — dynamic bounds */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center justify-between">
                                Khoảng giá <ChevronDown size={16} />
                            </h3>
                            <div className="space-y-4">
                                <input
                                    type="range"
                                    min={minPrice}
                                    max={maxPrice}
                                    step={10000}
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full accent-brand-accent"
                                />
                                <div className="flex justify-between text-xs font-bold text-red-500">
                                    <span>{formatVND(minPrice)}</span>
                                    <span>{formatVND(priceRange)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Size filter */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center justify-between">
                                Kích cỡ <ChevronDown size={16} />
                            </h3>
                            <div className="space-y-4">
                                {SIZES.map((size) => (
                                    <label key={size} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={selectedSizes.includes(size)}
                                            onChange={() => toggleSize(size)}
                                            className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent"
                                        />
                                        <span className="text-sm text-gray-500 group-hover:text-brand-primary">{size}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Reset filters */}
                        {(selectedDiscounts.length > 0 || selectedSizes.length > 0 || priceRange < maxPrice) && (
                            <button
                                onClick={() => { setSelectedDiscounts([]); setSelectedSizes([]); setPriceRange(maxPrice); }}
                                className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                            >
                                Xóa bộ lọc
                            </button>
                        )}
                    </aside>

                    {/* Product Grid */}
                    <div className="lg:col-span-3">
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                                {filteredProducts.map((product) => (
                                    <div key={product.id} className="relative">
                                        <ProductCard product={product} />
                                        <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                            -{product.discount}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-lg font-medium text-gray-600 mb-2">Không tìm thấy sản phẩm</p>
                                <p className="text-sm text-gray-400">Thử thay đổi bộ lọc hoặc danh mục khác</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
