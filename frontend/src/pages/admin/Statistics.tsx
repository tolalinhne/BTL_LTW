import React, { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, ChevronDown } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);
const formatShortVND = (n: number) => {
    if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}tr`;
    if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
    return String(n);
};

const ALL_MONTHLY_DATA: Record<string, { month: string; revenue: number; orders: number }[]> = {
    '2026': [
        { month: 'T1', revenue: 82000000, orders: 234 },
        { month: 'T2', revenue: 95000000, orders: 278 },
        { month: 'T3', revenue: 88000000, orders: 256 },
        { month: 'T4', revenue: 110000000, orders: 312 },
        { month: 'T5', revenue: 125000000, orders: 345 },
        { month: 'T6', revenue: 140000000, orders: 390 },
    ],
    '2025': [
        { month: 'T1', revenue: 55000000, orders: 150 },
        { month: 'T2', revenue: 62000000, orders: 170 },
        { month: 'T3', revenue: 58000000, orders: 160 },
        { month: 'T4', revenue: 72000000, orders: 200 },
        { month: 'T5', revenue: 80000000, orders: 220 },
        { month: 'T6', revenue: 90000000, orders: 250 },
        { month: 'T7', revenue: 85000000, orders: 240 },
        { month: 'T8', revenue: 95000000, orders: 260 },
        { month: 'T9', revenue: 100000000, orders: 280 },
        { month: 'T10', revenue: 110000000, orders: 310 },
        { month: 'T11', revenue: 120000000, orders: 340 },
        { month: 'T12', revenue: 130000000, orders: 370 },
    ],
};

const TOP_PRODUCTS = [
    { name: 'Lily Floral Dress', sold: 145, revenue: 113825000 },
    { name: 'Classic Tailored Blazer', sold: 89, revenue: 111250000 },
    { name: 'Garden Bloom Midi Dress', sold: 72, revenue: 61200000 },
    { name: 'Pastel Blouse', sold: 156, revenue: 66300000 },
    { name: 'Signature Tote Bag', sold: 203, revenue: 64960000 },
];

const YEARLY_STATS: Record<string, { revenue: number; orders: string; customers: string; avgOrder: number; revenueChange: number; orderChange: number; customerChange: number; avgChange: number }> = {
    '2026': { revenue: 640000000, orders: '1,815', customers: '2,451', avgOrder: 352000, revenueChange: 18.5, orderChange: 12.3, customerChange: 22.1, avgChange: 5.8 },
    '2025': { revenue: 1057000000, orders: '2,750', customers: '1,890', avgOrder: 384000, revenueChange: 35.2, orderChange: 28.7, customerChange: 40.5, avgChange: 4.2 },
};

export default function Statistics() {
    const [selectedYear, setSelectedYear] = useState('2026');

    const monthlyData = ALL_MONTHLY_DATA[selectedYear] || [];
    const stats = YEARLY_STATS[selectedYear] || YEARLY_STATS['2026'];
    const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
                    <p className="text-sm text-gray-500 mt-1">Phân tích dữ liệu kinh doanh</p>
                </div>
                <div className="relative">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        <option value="2026">Năm 2026</option>
                        <option value="2025">Năm 2025</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Tổng doanh thu" value={formatVND(stats.revenue)} change={stats.revenueChange} icon={<DollarSign size={20} />} color="bg-green-100 text-green-600" />
                <StatCard title="Tổng đơn hàng" value={stats.orders} change={stats.orderChange} icon={<ShoppingBag size={20} />} color="bg-blue-100 text-blue-600" />
                <StatCard title="Tổng khách hàng" value={stats.customers} change={stats.customerChange} icon={<Users size={20} />} color="bg-purple-100 text-purple-600" />
                <StatCard title="Giá trị TB/đơn" value={formatVND(stats.avgOrder)} change={stats.avgChange} icon={<TrendingUp size={20} />} color="bg-orange-100 text-orange-600" />
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-semibold text-gray-900">Doanh thu theo tháng</h3>
                        <span className="text-xs text-gray-400">{selectedYear}</span>
                    </div>
                    <div className="flex items-end gap-2" style={{ height: '192px' }}>
                        {monthlyData.map((d) => {
                            const barHeight = maxRevenue > 0 ? Math.max((d.revenue / maxRevenue) * 160, 4) : 4;
                            return (
                                <div key={d.month} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                                    {/* Tooltip */}
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                        <p className="font-medium">{formatVND(d.revenue)}</p>
                                        <p className="text-gray-300">{d.orders} đơn hàng</p>
                                    </div>
                                    <span className="text-[10px] text-gray-500 font-medium mb-1">{formatShortVND(d.revenue)}</span>
                                    <div
                                        className="w-full bg-primary/80 rounded-t-lg hover:bg-primary transition-colors cursor-pointer"
                                        style={{ height: `${barHeight}px` }}
                                    />
                                    <span className="text-xs text-gray-500 mt-1.5">{d.month}</span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Total row */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
                        <span className="text-gray-500">Tổng {selectedYear}</span>
                        <span className="font-semibold text-primary">
                            {formatVND(monthlyData.reduce((sum, d) => sum + d.revenue, 0))}
                        </span>
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
