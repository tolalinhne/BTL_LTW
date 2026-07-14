import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingBag, Layers, Truck, Users, BarChart3,
    Settings, Sparkles, LogOut, FileText, Shield, UserCog, Tag,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types/admin.types';

interface NavItem {
    id: string;
    label: string;
    path: string;
    icon: React.ElementType;
    roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['staff', 'admin'] },
    { id: 'orders', label: 'Đơn hàng', path: '/admin/orders', icon: Truck, roles: ['staff', 'admin'] },
    { id: 'products', label: 'Sản phẩm', path: '/admin/products', icon: ShoppingBag, roles: ['admin'] },
    { id: 'categories', label: 'Danh mục', path: '/admin/categories', icon: Layers, roles: ['admin'] },
    { id: 'users', label: 'Khách hàng', path: '/admin/users', icon: Users, roles: ['admin'] },
    { id: 'statistics', label: 'Thống kê', path: '/admin/statistics', icon: BarChart3, roles: ['admin'] },
    { id: 'blog', label: 'Blog', path: '/admin/blog', icon: FileText, roles: ['admin'] },
    { id: 'roles', label: 'Phân quyền', path: '/admin/roles', icon: Shield, roles: ['admin'] },
    { id: 'staff', label: 'Nhân viên', path: '/admin/staff', icon: UserCog, roles: ['admin'] },
    { id: 'saleoff', label: 'Quản lý Sale', path: '/admin/saleoff', icon: Tag, roles: ['admin'] },
];

export default function Sidebar() {
    const { role, logout, user } = useAuth();
    const navigate = useNavigate();

    const visibleItems = NAV_ITEMS.filter((item) => role && item.roles.includes(role));

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    return (
        <aside className="w-64 flex flex-col border-r border-primary/10 bg-white overflow-y-auto custom-scrollbar h-screen sticky top-0">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="bg-primary size-10 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h1 className="text-primary font-bold text-lg leading-none">LiLi Fashion</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        {role === 'admin' ? 'Admin Panel' : 'Staff Panel'}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 mt-4">
                {visibleItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.id}
                            to={item.path}
                            className={({ isActive }) =>
                                `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                    ? 'bg-primary text-white font-medium shadow-md shadow-primary/20'
                                    : 'text-slate-600 hover:bg-accent-soft group'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <Icon size={20} className={isActive ? '' : 'group-hover:text-primary'} />
                                    <span className="text-sm">{item.label}</span>
                                </>
                            )}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Bottom */}
            <div className="p-4 mt-auto">
                <div className="bg-accent-soft p-3 rounded-xl border border-primary/5 mb-3">
                    <p className="text-xs font-medium text-slate-700 truncate">{user?.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                    <p className="text-[10px] text-primary font-bold mt-1 uppercase">{role}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all group"
                >
                    <LogOut size={20} className="group-hover:text-red-500" />
                    <span className="text-sm">Đăng xuất</span>
                </button>
            </div>
        </aside>
    );
}
