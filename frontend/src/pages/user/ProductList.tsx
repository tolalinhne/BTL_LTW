import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, ChevronUp, Star, X, Sparkles, Search } from 'lucide-react';
import ProductCard from '@/components/user/ProductCard';
import api from '@/services/api';
import type { Product } from '@/types/user.types';

interface CategoryItem {
    id: number;
    name: string;
    slug: string;
    description?: string;
    productCount: number;
}

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
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search') || '';

    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState('all');
    const [minRating, setMinRating] = useState(0);
    const [dateFilter, setDateFilter] = useState('all');
    const [sortBySales, setSortBySales] = useState(false);
    const [showAllCategories, setShowAllCategories] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [signatureAllProducts, setSignatureAllProducts] = useState<Product[]>([]); // full list for client-side pagination
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);

    const isSignature = category?.toLowerCase() === 'signature';

    // ── Effect 1: Signature — fetch toàn bộ 1 lần khi vào trang ──────────
    useEffect(() => {
        if (!isSignature) return;
        let cancelled = false;
        const fetchSignature = async () => {
            setLoading(true);
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products/featured', { params: { limit: 200 } }),
                    api.get('/categories'),
                ]);
                if (cancelled) return;
                const prodData: Product[] = Array.isArray(prodRes.data?.data) ? prodRes.data.data : [];
                setSignatureAllProducts(prodData);
                setTotalProducts(prodData.length);
                setTotalPages(Math.max(1, Math.ceil(prodData.length / ITEMS_PER_PAGE)));
                setAllProducts(prodData.slice(0, ITEMS_PER_PAGE)); // trang 1
                setCurrentPage(1);
                const catData = catRes.data?.data?.data || catRes.data?.data || [];
                setCategories(Array.isArray(catData) ? catData : []);
            } catch (e) {
                console.error('Failed to fetch signature products:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchSignature();
        return () => { cancelled = true; };
    }, [isSignature]); // chỉ chạy khi vào/rời trang Signature

    // ── Effect 2: Signature — đổi trang → slice từ cache, không gọi API ──
    useEffect(() => {
        if (!isSignature || signatureAllProducts.length === 0) return;
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        setAllProducts(signatureAllProducts.slice(start, start + ITEMS_PER_PAGE));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentPage]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Effect 3: Non-Signature — server-side filter + pagination ─────────
    useEffect(() => {
        if (isSignature) return;
        let cancelled = false;
        const fetchData = async () => {
            setLoading(true);
            try {
                const prodParams: Record<string, any> = {
                    category,
                    sort: sortBySales ? 'best_seller' : sortBy,
                    limit: ITEMS_PER_PAGE,
                    page: currentPage,
                };
                // Đọc search query param từ URL nếu có
                if (searchQuery) {
                    prodParams.search = searchQuery;
                    delete prodParams.category; // khi search thì không filter category
                }
                if (priceRange !== 'all') {
                    const [min, max] = priceRange.split('-').map(Number);
                    prodParams.minPrice = min;
                    prodParams.maxPrice = max;
                }
                const [prodRes, catRes] = await Promise.all([
                    api.get('/products', { params: prodParams }),
                    api.get('/categories'),
                ]);
                if (cancelled) return;
                const pagedData = prodRes.data?.data;
                const prodData = pagedData?.data || pagedData?.items || pagedData || [];
                setAllProducts(Array.isArray(prodData) ? prodData : []);
                setTotalPages(pagedData?.totalPages || 1);
                setTotalProducts(pagedData?.total || 0);
                const catData = catRes.data?.data?.data || catRes.data?.data || [];
                setCategories(Array.isArray(catData) ? catData : []);
            } catch (e) {
                console.error('Failed to fetch products:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchData();
        return () => { cancelled = true; };
    }, [category, isSignature, sortBy, sortBySales, currentPage, priceRange, searchQuery]);

    // Reset về trang 1 khi đổi filter (non-Signature)
    useEffect(() => {
        if (!isSignature) setCurrentPage(1);
    }, [category, sortBy, sortBySales, priceRange, isSignature, searchQuery]);

    const featuredCategories = categories.filter((c: any) => c.isFeatured || c.is_featured);
    const allCategoriesToShow = categories;
    const displayCategories = showAllCategories ? allCategoriesToShow : (featuredCategories.length > 0 ? featuredCategories : categories.slice(0, 6));

    const filteredProducts = useMemo(() => {
        let products = allProducts;

        // Rating filter (client-side, backend doesn't support it)
        if (minRating > 0) {
            products = products.filter((p) => (p.rating || 0) >= minRating);
        }

        // Date filter (client-side)
        if (dateFilter !== 'all') {
            const days = Number(dateFilter);
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            products = products.filter((p) => p.createdAt && new Date(p.createdAt) >= cutoff);
        }

        return products;
    }, [allProducts, minRating, dateFilter]);

    // Find category name for breadcrumb
    const categoryName = category
        ? allCategoriesToShow.find((c: CategoryItem) => c.slug.toLowerCase() === category.toLowerCase())?.name || category
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
                    {categories.length > featuredCategories.length && (
                        <button
                            onClick={() => setShowAllCategories(!showAllCategories)}
                            className="flex items-center gap-1 text-sm font-medium text-brand-accent hover:underline"
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
                    {isSignature ? (
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-accent/10 text-brand-accent rounded-full text-xs font-semibold mb-2">
                                <Sparkles size={12} /> BST Độc quyền
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold">Signature Collection</h1>
                            <p className="text-sm text-gray-500 mt-1">{totalProducts} sản phẩm nổi bật được tuyển chọn</p>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold">
                                {searchQuery ? `Tìm kiếm: "${searchQuery}"` : (categoryName || 'Tất cả sản phẩm')}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">{totalProducts} sản phẩm</p>
                        </div>
                    )}
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
                            onChange={(e) => { setSortBy(e.target.value); setSortBySales(false); setCurrentPage(1); }}
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

            {/* Search result banner */}
            {searchQuery && (
                <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-brand-accent/5 border border-brand-accent/20 rounded-xl">
                    <Search size={16} className="text-brand-accent flex-shrink-0" />
                    <p className="text-sm text-gray-700">
                        Kết quả tìm kiếm cho: <strong className="text-brand-primary">"{searchQuery}"</strong>
                        {totalProducts > 0 && <span className="text-gray-500 ml-1">({totalProducts} sản phẩm)</span>}
                    </p>
                    <button
                        onClick={() => window.history.back()}
                        className="ml-auto text-xs text-brand-accent hover:underline whitespace-nowrap"
                    >
                        ✕ Xóa tìm kiếm
                    </button>
                </div>
            )}

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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 mb-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                        .reduce<(number | string)[]>((acc, p, idx, arr) => {
                            if (idx > 0 && p - (arr[idx - 1] as number) > 1) acc.push('...');
                            acc.push(p);
                            return acc;
                        }, [])
                        .map((p, i) =>
                            typeof p === 'string' ? (
                                <span key={`ellipsis-${i}`} className="px-2 text-gray-400">…</span>
                            ) : (
                                <button
                                    key={p}
                                    onClick={() => setCurrentPage(p)}
                                    className={`w-10 h-10 text-sm rounded-lg font-medium transition-colors ${
                                        currentPage === p
                                            ? 'bg-brand-primary text-white shadow-md'
                                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {p}
                                </button>
                            )
                        )}
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Sau →
                    </button>
                </div>
            )}
        </div>
    );
}
