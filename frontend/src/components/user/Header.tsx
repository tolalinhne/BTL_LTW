import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart, LogOut, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import api from '@/services/api';
import type { Product } from '@/types/user.types';

const formatPrice = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const isActiveLink = (to: string) => {
        if (to === '/') return location.pathname === '/';
        return location.pathname.startsWith(to);
    };

    const navLinks = [
        { to: '/', label: 'Trang chủ' },
        { to: '/products', label: 'Sản phẩm' },
        { to: '/saleoff', label: 'Sale-Off' },
        { to: '/store', label: 'Cửa hàng' },
        { to: '/blog', label: 'Blog' },
    ];

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setSearchOpen(false);
                setSearchQuery('');
                setSearchResults([]);
                setHasSearched(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Tải sản phẩm liên quan (phổ biến) khi mở search lần đầu
    useEffect(() => {
        if (searchOpen && relatedProducts.length === 0) {
            api.get('/products', { params: { sort: 'newest', limit: 6 } })
                .then((res) => {
                    const data = res.data?.data?.data || res.data?.data?.items || res.data?.data || [];
                    setRelatedProducts(Array.isArray(data) ? data.slice(0, 6) : []);
                })
                .catch(() => {});
        }
        if (searchOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [searchOpen]);

    // Debounce search — tìm ngay khi gõ
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            setHasSearched(false);
            return;
        }
        const timer = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await api.get('/products', {
                    params: { search: searchQuery.trim(), limit: 8 },
                });
                const data = res.data?.data?.data || res.data?.data?.items || res.data?.data || [];
                setSearchResults(Array.isArray(data) ? data : []);
            } catch {
                setSearchResults([]);
            } finally {
                setSearchLoading(false);
                setHasSearched(true);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleGoToSearch = useCallback(() => {
        if (!searchQuery.trim()) return;
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    }, [searchQuery, navigate]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleGoToSearch();
        if (e.key === 'Escape') {
            setSearchOpen(false);
            setSearchQuery('');
        }
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
        setHasSearched(false);
    };

    // Danh sách hiển thị trong dropdown
    const displayProducts = searchQuery.trim()
        ? searchResults
        : relatedProducts;
    const isShowingRelated = !searchQuery.trim();
    const noResults = hasSearched && searchResults.length === 0;

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden p-2 text-brand-primary hover:text-brand-accent transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <span className="font-serif text-2xl font-bold tracking-tight text-brand-primary">
                            Li<span className="text-brand-accent">Li</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const active = isActiveLink(link.to);
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`text-sm font-medium transition-colors relative group ${active ? 'text-brand-primary' : 'text-gray-600 hover:text-brand-primary'
                                        }`}
                                >
                                    {link.label}
                                    <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-accent transition-all ${active ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`} />
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className="p-2 text-gray-600 hover:text-brand-primary transition-colors"
                        >
                            <Search size={20} />
                        </button>

                        <Link
                            to={isAuthenticated ? '/wishlist' : '/login'}
                            className="p-2 text-gray-600 hover:text-red-500 transition-colors hidden sm:block relative"
                        >
                            <Heart size={20} />
                        </Link>

                        <Link to="/cart" id="header-cart-icon" className="p-2 text-gray-600 hover:text-brand-primary transition-colors relative">
                            <ShoppingBag size={20} />
                            {itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-brand-accent text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                    {itemCount > 99 ? '99+' : itemCount}
                                </span>
                            )}
                        </Link>

                        {isAuthenticated ? (
                            <div className="relative group">
                                <Link to="/profile" className="p-2 text-gray-600 hover:text-brand-primary transition-colors">
                                    <User size={20} />
                                </Link>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                    <div className="p-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-brand-primary truncate">{user?.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-1">
                                        <Link to="/profile" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                            <User size={16} /> Tài khoản
                                        </Link>
                                        <Link to="/orders" className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                            <ShoppingBag size={16} /> Đơn hàng
                                        </Link>
                                        <button
                                            onClick={() => { logout(); navigate('/'); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg"
                                        >
                                            <LogOut size={16} /> Đăng xuất
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-primary hover:bg-brand-primary/90 rounded-full transition-colors"
                            >
                                <User size={16} /> Đăng nhập
                            </Link>
                        )}
                    </div>
                </div>

                {/* Search Dropdown */}
                {searchOpen && (
                    <div ref={searchRef} className="pb-3">
                        {/* Input */}
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={inputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Tìm kiếm sản phẩm theo tên..."
                                className="w-full pl-11 pr-32 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                {searchQuery && (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSearchResults([]); setHasSearched(false); }}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                                <button
                                    onClick={handleGoToSearch}
                                    disabled={!searchQuery.trim()}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-brand-primary text-white text-xs font-medium rounded-xl hover:bg-brand-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    Tìm <ArrowRight size={12} />
                                </button>
                            </div>
                        </div>

                        {/* Results Dropdown */}
                        <div className="mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                            {/* Header của dropdown */}
                            <div className="px-4 py-2.5 border-b border-gray-50 flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    {searchLoading ? (
                                        <>
                                            <div className="w-3 h-3 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
                                            Đang tìm...
                                        </>
                                    ) : isShowingRelated ? (
                                        <><Sparkles size={12} className="text-brand-accent" /> Sản phẩm mới nhất</>
                                    ) : noResults ? (
                                        'Không tìm thấy kết quả'
                                    ) : (
                                        `${searchResults.length} kết quả cho "${searchQuery}"`
                                    )}
                                </span>
                                {!isShowingRelated && !noResults && !searchLoading && (
                                    <button
                                        onClick={handleGoToSearch}
                                        className="text-xs text-brand-accent hover:underline flex items-center gap-0.5"
                                    >
                                        Xem tất cả <ArrowRight size={11} />
                                    </button>
                                )}
                            </div>

                            {/* No results → hiển thị sản phẩm liên quan */}
                            {noResults && (
                                <>
                                    <div className="px-4 py-3 bg-amber-50 border-b border-amber-100">
                                        <p className="text-xs text-amber-700">
                                            Không tìm thấy "<span className="font-semibold">{searchQuery}</span>". Có thể bạn thích:
                                        </p>
                                    </div>
                                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                        {relatedProducts.slice(0, 5).map((product) => (
                                            <ProductSearchRow
                                                key={product.id}
                                                product={product}
                                                onClose={closeSearch}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Kết quả tìm kiếm hoặc sản phẩm liên quan */}
                            {!noResults && !searchLoading && displayProducts.length > 0 && (
                                <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                                    {displayProducts.map((product) => (
                                        <ProductSearchRow
                                            key={product.id}
                                            product={product}
                                            onClose={closeSearch}
                                            highlight={!isShowingRelated ? searchQuery : undefined}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Skeleton loading */}
                            {searchLoading && (
                                <div className="divide-y divide-gray-50">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-3 px-4 py-3 animate-pulse">
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex-shrink-0" />
                                            <div className="flex-1 space-y-1.5">
                                                <div className="h-3 bg-gray-200 rounded w-3/4" />
                                                <div className="h-3 bg-gray-200 rounded w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Footer hint */}
                            {!searchLoading && (
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
                                    <p className="text-[11px] text-gray-400">
                                        Nhấn <kbd className="px-1 py-0.5 bg-white border border-gray-200 rounded text-[10px]">Enter</kbd> để tìm kiếm đầy đủ
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white">
                    <nav className="px-4 py-3 space-y-1">
                        {navLinks.map((link) => {
                            const active = isActiveLink(link.to);
                            return (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${active
                                        ? 'text-brand-primary bg-brand-accent/5 border-l-2 border-brand-accent'
                                        : 'text-gray-600 hover:text-brand-primary hover:bg-gray-50'
                                        }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                        {!isAuthenticated && (
                            <Link
                                to="/login"
                                onClick={() => setMobileMenuOpen(false)}
                                className="block px-3 py-2.5 text-sm font-medium text-brand-accent hover:bg-brand-accent/5 rounded-lg"
                            >
                                Đăng nhập
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

// ── Sub-component: hàng sản phẩm trong dropdown ──────────────────────────────
function ProductSearchRow({
    product,
    onClose,
    highlight,
}: {
    product: Product;
    onClose: () => void;
    highlight?: string;
}) {
    const displayPrice = (product as any).salePrice ?? product.price;
    const hasDiscount = (product as any).salePrice && (product as any).salePrice < product.price;

    // Bold phần text khớp với query
    const highlightText = (text: string, query?: string) => {
        if (!query) return <>{text}</>;
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return <>{text}</>;
        return (
            <>
                {text.slice(0, idx)}
                <mark className="bg-brand-accent/20 text-brand-primary font-semibold rounded-sm px-0.5">
                    {text.slice(idx, idx + query.length)}
                </mark>
                {text.slice(idx + query.length)}
            </>
        );
    };

    return (
        <Link
            to={`/products/${product.id}`}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
        >
            <img
                src={(product as any).imageUrl || (product as any).image || (product as any).productImage || 'https://placehold.co/60x60'}
                alt={product.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100"
            />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-primary transition-colors">
                    {highlightText(product.name, highlight)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs font-semibold ${hasDiscount ? 'text-red-500' : 'text-brand-accent'}`}>
                        {formatPrice(displayPrice)}
                    </span>
                    {hasDiscount && (
                        <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(product.price)}
                        </span>
                    )}
                    {product.category && (
                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                            {typeof product.category === 'string' ? product.category : (product.category as any)?.name}
                        </span>
                    )}
                </div>
            </div>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-brand-accent flex-shrink-0 transition-colors" />
        </Link>
    );
}
