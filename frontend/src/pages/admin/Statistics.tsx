import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, ChevronDown } from 'lucide-react';
import StatCard from '@/components/admin/StatCard';
import api from '@/services/api';

const formatVND = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatShortVND = (n: number) => {
    if (n >= 1_000_000) return `${Math.round(n / 1_000_000)}tr`;
    if (n >= 1_000)     return `${Math.round(n / 1_000)}k`;
    return String(n);
};

interface MonthlyData { month: string; revenue: number; orders: number }
interface TopProduct  { productId: number; name: string; sold: number; revenue: number }
interface YearlyStats {
    revenue: number;
    orders: number;
    deliveredOrders: number;
    customers: number;
    avgOrder: number;
    revenueChange: number;
    orderChange: number;
    customerChange: number;
    avgChange: number;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = [CURRENT_YEAR, CURRENT_YEAR - 1, CURRENT_YEAR - 2];

export default function Statistics() {
    const [selectedYear, setSelectedYear] = useState(String(CURRENT_YEAR));
    const [loading,      setLoading]      = useState(true);
    const [monthlyData,  setMonthlyData]  = useState<MonthlyData[]>([]);
    const [stats,        setStats]        = useState<YearlyStats | null>(null);
    const [topProducts,  setTopProducts]  = useState<TopProduct[]>([]);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const res  = await api.get(`/admin/statistics?year=${selectedYear}`);
                const data = res.data?.data;
                if (data) {
                    setMonthlyData(data.monthlyData  ?? []);
                    setStats(data.yearlyStats        ?? null);
                    setTopProducts(data.topProducts  ?? []);
                }
            } catch (err) {
                console.error('Không thể tải thống kê:', err);
                setMonthlyData([]);
                setStats(null);
                setTopProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [selectedYear]);

    const maxRevenue = monthlyData.length > 0
        ? Math.max(...monthlyData.map(d => d.revenue))
        : 0;

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Thống kê</h1>
                    <p className="text-sm text-gray-500 mt-1">Phân tích dữ liệu kinh doanh</p>
                </div>
                <div className="relative">
                    <select
                        value={selectedYear}
                        onChange={e => setSelectedYear(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                        {YEAR_OPTIONS.map(y => (
                            <option key={y} value={String(y)}>Năm {y}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {loading ? (
                /* Skeleton loader */
                <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                    <div className="grid lg:grid-cols-2 gap-6">
                        <div className="h-72 bg-gray-100 rounded-xl" />
                        <div className="h-72 bg-gray-100 rounded-xl" />
                    </div>
                </div>
            ) : !stats ? (
                /* Empty state */
                <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                    <ShoppingBag size={48} className="mb-3 opacity-30" />
                    <p className="text-lg font-medium">Chưa có dữ liệu cho năm {selectedYear}</p>
                    <p className="text-sm mt-1">Năm này chưa có đơn hàng nào được ghi nhận.</p>
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard
                            title="Tổng doanh thu"
                            value={formatVND(stats.revenue)}
                            change={stats.revenueChange}
                            icon={<DollarSign size={20} />}
                            color="bg-green-100 text-green-600"
                        />
                        <StatCard
                            title="Tổng đơn hàng"
                            value={String(stats.orders)}
                            change={stats.orderChange}
                            icon={<ShoppingBag size={20} />}
                            color="bg-blue-100 text-blue-600"
                        />
                        <StatCard
                            title="Khách hàng"
                            value={String(stats.customers)}
                            change={stats.customerChange}
                            icon={<Users size={20} />}
                            color="bg-purple-100 text-purple-600"
                        />
                        <StatCard
                            title="Giá trị TB/đơn"
                            value={formatVND(stats.avgOrder)}
                            change={stats.avgChange}
                            icon={<TrendingUp size={20} />}
                            color="bg-orange-100 text-orange-600"
                        />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        {/* Revenue Bar Chart */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-semibold text-gray-900">Doanh thu theo tháng</h3>
                                <span className="text-xs text-gray-400">{selectedYear}</span>
                            </div>

                            {monthlyData.length === 0 ? (
                                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                                    Không có dữ liệu doanh thu
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-end gap-2" style={{ height: '192px' }}>
                                        {monthlyData.map(d => {
                                            const barHeight = maxRevenue > 0
                                                ? Math.max((d.revenue / maxRevenue) * 160, 4)
                                                : 4;
                                            return (
                                                <div
                                                    key={d.month}
                                                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                                                >
                                                    {/* Tooltip */}
                                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                                        <p className="font-medium">{formatVND(d.revenue)}</p>
                                                        <p className="text-gray-300">{d.orders} đơn hàng</p>
                                                    </div>
                                                    <span className="text-[10px] text-gray-500 font-medium mb-1">
                                                        {formatShortVND(d.revenue)}
                                                    </span>
                                                    <div
                                                        className="w-full bg-primary/80 rounded-t-lg hover:bg-primary transition-colors cursor-pointer"
                                                        style={{ height: `${barHeight}px` }}
                                                    />
                                                    <span className="text-xs text-gray-500 mt-1.5">{d.month}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between text-sm">
                                        <span className="text-gray-500">Tổng {selectedYear}</span>
                                        <span className="font-semibold text-primary">
                                            {formatVND(monthlyData.reduce((s, d) => s + d.revenue, 0))}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Top Products */}
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Sản phẩm bán chạy</h3>

                            {topProducts.length === 0 ? (
                                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                                    Không có dữ liệu sản phẩm
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {topProducts.map((p, i) => (
                                        <div key={p.productId} className="flex items-center gap-3">
                                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                                i === 0 ? 'bg-yellow-100 text-yellow-700'
                                                : i === 1 ? 'bg-gray-100 text-gray-600'
                                                : i === 2 ? 'bg-orange-100 text-orange-600'
                                                : 'bg-gray-50 text-gray-400'
                                            }`}>
                                                {i + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                                                <p className="text-xs text-gray-500">{p.sold} đã bán</p>
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">
                                                {formatVND(p.revenue)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
