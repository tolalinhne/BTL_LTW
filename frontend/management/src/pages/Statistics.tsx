import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import StatCard from '@/components/StatCard';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const MONTHLY_DATA = [
    { month: 'T1', revenue: 82000000, orders: 234 },
    { month: 'T2', revenue: 95000000, orders: 278 },
    { month: 'T3', revenue: 88000000, orders: 256 },
    { month: 'T4', revenue: 110000000, orders: 312 },
    { month: 'T5', revenue: 125000000, orders: 345 },
    { month: 'T6', revenue: 140000000, orders: 390 },
];

const TOP_PRODUCTS = [
    { name: 'Lily Floral Dress', sold: 145, revenue: 113825000 },
    { name: 'Classic Tailored Blazer', sold: 89, revenue: 111250000 },
    { name: 'Garden Bloom Midi Dress', sold: 72, revenue: 61200000 },
    { name: 'Pastel Blouse', sold: 156, revenue: 66300000 },
    { name: 'Signature Tote Bag', sold: 203, revenue: 64960000 },
];

export default function Statistics() {
    const maxRevenue = Math.max(...MONTHLY_DATA.map((d) => d.revenue));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
                    <p className="text-sm text-gray-500 mt-1">Phân tích dữ liệu kinh doanh</p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Tổng doanh thu" value={formatVND(640000000)} change={18.5} icon={<DollarSign size={20} />} color="bg-green-100 text-green-600" />
                <StatCard title="Tổng đơn hàng" value="1,815" change={12.3} icon={<ShoppingBag size={20} />} color="bg-blue-100 text-blue-600" />
                <StatCard title="Tổng khách hàng" value="2,451" change={22.1} icon={<Users size={20} />} color="bg-purple-100 text-purple-600" />
                <StatCard title="Giá trị TB/đơn" value={formatVND(352000)} change={5.8} icon={<TrendingUp size={20} />} color="bg-orange-100 text-orange-600" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart (simple bar chart) */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-6">Doanh thu theo tháng</h3>
                    <div className="flex items-end gap-3 h-48">
                        {MONTHLY_DATA.map((d) => (
                            <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                                <span className="text-[10px] text-gray-500 font-medium">{formatVND(d.revenue / 1000000)}tr</span>
                                <div
                                    className="w-full bg-primary/80 rounded-t-lg hover:bg-primary transition-colors cursor-pointer"
                                    style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                                />
                                <span className="text-xs text-gray-500">{d.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>
                    <div className="space-y-4">
                        {TOP_PRODUCTS.map((p, i) => (
                            <div key={p.name} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-100 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-gray-50 text-gray-400'
                                    }`}>
                                    {i + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-500">{p.sold} đã bán</p>
                                </div>
                                <span className="text-sm font-semibold text-gray-700">{formatVND(p.revenue)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
