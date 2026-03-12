import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Menu, X, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export default function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCart();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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

                {/* Search bar */}
                {searchOpen && (
                    <div className="pb-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                                autoFocus
                            />
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
