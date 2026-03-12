import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, LogIn } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/utils/formatPrice';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, subtotal: fullSubtotal } = useCart();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const getItemKey = (item: typeof cart[0]) => `${item.id}-${item.selectedSize}-${item.selectedColor}`;

    const [selectedIds, setSelectedIds] = useState<string[]>(() =>
        cart.map(getItemKey)
    );

    // Keep selectedIds in sync when cart changes
    const validSelectedIds = useMemo(
        () => selectedIds.filter((id) => cart.some((item) => getItemKey(item) === id)),
        [selectedIds, cart]
    );

    const selectedItems = useMemo(
        () => cart.filter((item) => validSelectedIds.includes(getItemKey(item))),
        [cart, validSelectedIds]
    );

    const subtotal = useMemo(
        () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
        [selectedItems]
    );

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal > 0 ? subtotal + shippingFee : 0;

    const toggleItem = (key: string) => {
        setSelectedIds((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );
    };

    const toggleAll = () => {
        if (validSelectedIds.length === cart.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(cart.map(getItemKey));
        }
    };

    const handleCheckout = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: '/checkout' } } });
            return;
        }
        if (selectedItems.length === 0) return;
        navigate('/checkout', { state: { selectedKeys: validSelectedIds } });
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <ShoppingBag size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-500 mb-6">Hãy thêm sản phẩm yêu thích vào giỏ hàng</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                >
                    Tiếp tục mua sắm <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold">Giỏ hàng ({cart.length})</h1>
                <button
                    type="button"
                    onClick={toggleAll}
                    className="text-sm text-brand-accent hover:underline"
                >
                    {validSelectedIds.length === cart.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => {
                        const key = getItemKey(item);
                        const isSelected = validSelectedIds.includes(key);
                        return (
                            <div
                                key={key}
                                className={`flex gap-4 p-4 bg-white rounded-xl border shadow-sm transition-colors ${isSelected ? 'border-brand-accent/30' : 'border-gray-100'
                                    }`}
                            >
                                {/* Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => toggleItem(key)}
                                        className="w-4 h-4 accent-brand-accent rounded cursor-pointer"
                                    />
                                </div>
                                <div className="w-24 h-28 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-brand-primary truncate">{item.name}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                        <span>Size: {item.selectedSize}</span>
                                        <span className="flex items-center gap-1">
                                            Màu: <span className="w-3 h-3 rounded-full inline-block border" style={{ backgroundColor: item.selectedColor }} />
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold mt-2">{formatPrice(item.price)}</p>
                                    <div className="flex items-center justify-between mt-3">
                                        <div className="inline-flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity - 1)}
                                                className="p-1.5 text-gray-400 hover:text-brand-primary"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.selectedSize, item.selectedColor, item.quantity + 1)}
                                                className="p-1.5 text-gray-400 hover:text-brand-primary"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit shadow-sm sticky top-24">
                    <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
                    {selectedItems.length === 0 ? (
                        <p className="text-sm text-gray-400 py-4 text-center">Chọn sản phẩm để xem tóm tắt</p>
                    ) : (
                        <>
                            <div className="space-y-2 text-sm mb-3 max-h-40 overflow-y-auto">
                                {selectedItems.map((item) => (
                                    <div key={getItemKey(item)} className="flex justify-between text-gray-600">
                                        <span className="truncate mr-2">{item.name} x{item.quantity}</span>
                                        <span className="whitespace-nowrap font-medium">{formatPrice(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-gray-100 pt-3 space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Tạm tính ({selectedItems.length} SP)</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Phí vận chuyển</span>
                                    <span className="font-medium">{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                                </div>
                                {shippingFee > 0 && (
                                    <p className="text-xs text-brand-accent">Mua thêm {formatPrice(500000 - subtotal)} để được miễn phí ship</p>
                                )}
                                <div className="border-t border-gray-100 pt-3 flex justify-between text-base">
                                    <span className="font-semibold">Tổng cộng</span>
                                    <span className="font-bold text-brand-accent">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </>
                    )}

                    {isAuthenticated ? (
                        <button
                            onClick={handleCheckout}
                            disabled={selectedItems.length === 0}
                            className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Thanh toán ({selectedItems.length}) <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={() => navigate('/login', { state: { from: { pathname: '/checkout' } } })}
                            className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-accent text-white font-semibold rounded-full hover:bg-brand-accent/90 transition-colors"
                        >
                            <LogIn size={16} /> Đăng nhập để thanh toán
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
