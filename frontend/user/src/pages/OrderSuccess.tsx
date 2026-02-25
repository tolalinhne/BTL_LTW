import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';

export default function OrderSuccess() {
    return (
        <div className="max-w-lg mx-auto px-4 py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-3">Đặt hàng thành công!</h1>
            <p className="text-gray-500 mb-8">
                Cảm ơn bạn đã mua hàng. Chúng tôi sẽ liên hệ xác nhận đơn hàng trong thời gian sớm nhất.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                    to="/orders"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                >
                    <ShoppingBag size={16} /> Xem đơn hàng
                </Link>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-600 text-sm font-semibold rounded-full hover:border-brand-primary hover:text-brand-primary transition-colors"
                >
                    <Home size={16} /> Về trang chủ
                </Link>
            </div>
        </div>
    );
}
