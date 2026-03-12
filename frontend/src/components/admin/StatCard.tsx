import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    change?: number;
    icon: React.ReactNode;
    color?: string;
}

export default function StatCard({ title, value, change, icon, color = 'bg-primary/10 text-primary' }: StatCardProps) {
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {change !== undefined && (
                        <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${change >= 0 ? 'text-success' : 'text-danger'}`}>
                            {change >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            <span>{change >= 0 ? '+' : ''}{change}%</span>
                            <span className="text-gray-400 ml-1">vs tháng trước</span>
                        </div>
                    )}
                </div>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}
