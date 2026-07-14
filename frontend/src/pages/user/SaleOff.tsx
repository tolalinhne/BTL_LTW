import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/user/ProductCard';
import api from '@/services/api';
import { getActiveSales } from '@/services/admin/sale.service';
import type { Product } from '@/types/user.types';
import type { SaleItem } from '@/services/admin/sale.service';

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

// Enrich products with sale info (isSale, salePrice, discountPercent)
function enrichWithSaleData(products: Product[], activeSales: SaleItem[]): Product[] {
    // Build map: productId → best discountPercent
    const saleMap = new Map<number, number>();
    for (const sale of activeSales) {
        for (const pid of sale.productIds) {
            const existing = saleMap.get(pid) || 0;
            if (sale.discountPercent > existing) {
                saleMap.set(pid, sale.discountPercent);
            }
        }
    }
    return products.map((p) => {
        const discountPct = saleMap.get(Number(p.id));
        if (discountPct && discountPct > 0) {
            const salePrice = Math.round(p.price * (1 - discountPct / 100));
            return { ...p, isSale: true, discount: discountPct, discountPercent: discountPct, salePrice };
        }
        return p;
    });
}

export default function SaleOff() {
    const { category } = useParams<{ category?: string }>();
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [selectedDiscounts, setSelectedDiscounts] = useState<number[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [saleProducts, setSaleProducts] = useState<Product[]>([]);
    const [activeSales, setActiveSales] = useState<SaleItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 9;

    useEffect(() => {
        const fetchSaleProducts = async () => {
            setLoading(true);
            try {
                const [salesData, productsRes] = await Promise.all([
                    getActiveSales(),
                    api.get('/products', { params: { sort: 'newest', limit: 200 } }),
                ]);
                setActiveSales(salesData);

                const prodData = productsRes.data?.data?.data || productsRes.data?.data?.items || productsRes.data?.data || [];
                const all: Product[] = Array.isArray(prodData) ? prodData : [];

                // Filter to only products in active sales
                const saleProductIds = new Set<number>();
                for (const sale of salesData) {
                    for (const pid of sale.productIds) saleProductIds.add(pid);
                }
                const onSale = all.filter((p) => saleProductIds.has(Number(p.id)));
                setSaleProducts(enrichWithSaleData(onSale, salesData));
            } catch (e) {
                console.error('Failed to fetch sale products:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchSaleProducts();
    }, []);

    const minPrice = useMemo(() => saleProducts.length > 0 ? Math.min(...saleProducts.map((p) => p.salePrice ?? p.price)) : 0, [saleProducts]);
    const maxPrice = useMemo(() => saleProducts.length > 0 ? Math.max(...saleProducts.map((p) => p.salePrice ?? p.price)) : 1000000, [saleProducts]);
    const [priceRange, setPriceRange] = useState(maxPrice);
    useEffect(() => { setPriceRange(maxPrice); }, [maxPrice]);

    const activeTabIdx = useMemo(() => {
        if (!category) return 0;
        const idx = SALE_TABS.findIndex((t) => t.slug === category);
        return idx >= 0 ? idx : 0;
    }, [category]);

    // Tính countdown từ endTime của sale active sớm kết thúc nhất
    useEffect(() => {
        if (activeSales.length === 0) return;

        // Tìm endTime sớm nhất trong các sale đang active
        const earliest = activeSales
            .filter((s) => s.endTime)
            .map((s) => new Date(s.endTime!).getTime())
            .filter((t) => t > Date.now())
            .sort((a, b) => a - b)[0];

        // Nếu không có endTime hợp lệ, fallback về 24h tới
        const target = earliest ?? (Date.now() + 24 * 3600 * 1000);

        const calcLeft = () => {
            const diff = Math.max(0, target - Date.now());
            return {
                hours: Math.floor(diff / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            };
        };

        setTimeLeft(calcLeft());
        const timer = setInterval(() => {
            const left = calcLeft();
            setTimeLeft(left);
            if (left.hours === 0 && left.minutes === 0 && left.seconds === 0) {
                clearInterval(timer);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [activeSales]);

    const toggleDiscount = (idx: number) => {
        setSelectedDiscounts((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
    };
    const toggleSize = (size: string) => {
        setSelectedSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]);
    };

    const filteredProducts = useMemo(() => {
        let products = saleProducts;
        const tabCategory = SALE_TABS[activeTabIdx].category;
        if (tabCategory) products = products.filter((p) => p.category === tabCategory);
        if (selectedDiscounts.length > 0) {
            products = products.filter((p) => {
                const d = p.discountPercent || p.discount || 0;
                return selectedDiscounts.some((idx) => {
                    const range = DISCOUNT_RANGES[idx];
                    return d >= range.min && d <= range.max;
                });
            });
        }
        products = products.filter((p) => (p.salePrice ?? p.price) <= priceRange);
        return products;
    }, [saleProducts, activeTabIdx, selectedDiscounts, priceRange, selectedSizes]);

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTabIdx, selectedDiscounts, priceRange, selectedSizes]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    // Best coupon code to display
    const bestCoupon = useMemo(() =>
        activeSales.filter((s) => s.couponCode).sort((a, b) => b.discountPercent - a.discountPercent)[0] || null,
        [activeSales]
    );

    const maxDiscount = activeSales.length > 0 ? Math.max(...activeSales.map((s) => s.discountPercent)) : 50;
    const formatVND = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + ' ₫';

    // Dynamic banner info từ sale đang active
    const activeSaleName = useMemo(() => {
        const named = activeSales.find((s) => s.name);
        return named?.name || 'Flash Sale';
    }, [activeSales]);

    const activeSaleEndDate = useMemo(() => {
        const earliest = activeSales
            .filter((s) => s.endTime)
            .map((s) => new Date(s.endTime!))
            .filter((d) => d.getTime() > Date.now())
            .sort((a, b) => a.getTime() - b.getTime())[0];
        return earliest ?? null;
    }, [activeSales]);

    const bannerSeed = useMemo(() => {
        // Dùng tên sale để tạo seed ngẫu nhiên nhưng ổn định theo đợt sale
        const seed = activeSaleName.replace(/\s+/g, '').toLowerCase() || 'salebanner';
        return seed;
    }, [activeSaleName]);

    return (
        <div className="pb-20">
            {/* Sale Banner - Dynamic */}
            <section className="relative h-[60vh] overflow-hidden">
                <img
                    src={`https://picsum.photos/seed/${bannerSeed}/1920/1080`}
                    alt={activeSaleName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white text-center px-4">
                    {activeSaleEndDate ? (
                        <p className="text-sm font-medium uppercase tracking-[0.3em] mb-4 bg-white/10 px-4 py-1 rounded-full">
                            Kết thúc: {activeSaleEndDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                    ) : (
                        <p className="text-sm font-medium uppercase tracking-[0.3em] mb-4">End of Season</p>
                    )}
                    <h1 className="text-5xl md:text-8xl font-serif mb-3 tracking-tighter">{activeSaleName}</h1>
                    <div className="flex items-center gap-4 text-2xl md:text-4xl font-serif">
                        <span>UP TO</span>
                        <span className="text-6xl md:text-8xl font-bold">{maxDiscount}%</span>
                        <span>OFF</span>
                    </div>
                </div>
            </section>

            {/* Coupon banner */}
            {bestCoupon && (
                <div className="bg-red-500 text-white py-3 text-center text-sm font-medium">
                    <Tag size={14} className="inline mr-2" />
                    Dùng mã <strong className="font-mono bg-white/20 px-2 py-0.5 rounded mx-1">{bestCoupon.couponCode}</strong>
                    để giảm thêm {bestCoupon.discountPercent}%!
                </div>
            )}

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

                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center justify-between">
                                Giá sale <ChevronDown size={16} />
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
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="aspect-[3/4] bg-gray-200 rounded-2xl mb-3" />
                                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                    </div>
                                ))}
                            </div>
                        ) : paginatedProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                                    {paginatedProducts.map((product) => (
                                        <div key={product.id} className="relative">
                                            <ProductCard product={product} />
                                            <div className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                                                -{product.discountPercent || product.discount}%
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Phân trang */}
                                {totalPages > 1 && (
                                    <div className="mt-16 flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-50 hover:border-brand-accent hover:text-brand-accent transition-colors"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        
                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            const page = idx + 1;
                                            // Chỉ hiển thị tối đa 5 trang xung quanh trang hiện tại để chống tràn
                                            if (totalPages > 5 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                                                if (page === 2 || page === totalPages - 1) {
                                                    return <span key={page} className="px-1 text-gray-400">...</span>;
                                                }
                                                return null;
                                            }
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                                        currentPage === page
                                                            ? 'bg-brand-accent text-white'
                                                            : 'border border-gray-200 text-gray-600 hover:border-brand-accent hover:text-brand-accent'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}

                                        <button
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-50 hover:border-brand-accent hover:text-brand-accent transition-colors"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-20">
                                <p className="text-lg font-medium text-gray-600 mb-2">
                                    {activeSales.length === 0 ? 'Hiện chưa có chương trình sale nào' : 'Không tìm thấy sản phẩm'}
                                </p>
                                <p className="text-sm text-gray-400">
                                    {activeSales.length === 0 ? 'Quay lại sau để không bỏ lỡ ưu đãi nhé!' : 'Thử thay đổi bộ lọc hoặc danh mục khác'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
