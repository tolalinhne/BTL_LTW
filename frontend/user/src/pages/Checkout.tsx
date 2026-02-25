import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/formatPrice';

export default function Checkout() {
    const navigate = useNavigate();
    const { cart, subtotal, clearCart } = useCart();
    const [form, setForm] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        note: '',
        paymentMethod: 'cod',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        await new Promise((r) => setTimeout(r, 1500));
        clearCart();
        navigate('/order-success');
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-8">Thanh toán</h1>

            <form onSubmit={handleSubmit}>
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Shipping info */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Thông tin giao hàng</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                                    <input name="name" value={form.name} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input name="email" type="email" value={form.email} onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                                    <input name="address" value={form.address} onChange={handleChange} required
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                                    <textarea name="note" value={form.note} onChange={handleChange} rows={3}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent resize-none" />
                                </div>
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold mb-4">Phương thức thanh toán</h3>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'cod' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="paymentMethod" value="cod" checked={form.paymentMethod === 'cod'} onChange={handleChange} className="accent-brand-accent" />
                                    <Banknote size={20} className="text-brand-accent" />
                                    <div>
                                        <p className="text-sm font-medium">Thanh toán khi nhận hàng (COD)</p>
                                        <p className="text-xs text-gray-500">Trả tiền mặt khi nhận hàng</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'bank' ? 'border-brand-accent bg-brand-accent/5' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="paymentMethod" value="bank" checked={form.paymentMethod === 'bank'} onChange={handleChange} className="accent-brand-accent" />
                                    <CreditCard size={20} className="text-brand-accent" />
                                    <div>
                                        <p className="text-sm font-medium">Chuyển khoản ngân hàng</p>
                                        <p className="text-xs text-gray-500">Chuyển khoản qua QR code</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 h-fit shadow-sm sticky top-24">
                        <h3 className="text-lg font-semibold mb-4">Đơn hàng</h3>
                        <div className="space-y-3 mb-4">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.selectedSize}`} className="flex items-center gap-3">
                                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tạm tính</span>
                                <span>{formatPrice(subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Vận chuyển</span>
                                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-2 flex justify-between text-base">
                                <span className="font-semibold">Tổng</span>
                                <span className="font-bold text-brand-accent">{formatPrice(total)}</span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
                            {!isSubmitting && <ChevronRight size={16} />}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
