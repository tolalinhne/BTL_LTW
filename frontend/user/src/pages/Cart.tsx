import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/formatPrice';

export default function Cart() {
    const { cart, removeFromCart, updateQuantity, subtotal } = useCart();

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

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-8">Giỏ hàng ({cart.length})</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div
                            key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                            className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                        >
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
                    ))}
                </div>

                {/* Summary */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit shadow-sm sticky top-24">
                    <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Tạm tính</span>
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
                    <Link
                        to="/checkout"
                        className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                    >
                        Thanh toán <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
