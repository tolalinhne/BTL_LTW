import React, { useState, useEffect } from 'react';
import { Search, Eye, Trash2, Users as UsersIcon } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import api from '@/services/api';

interface Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    avatar?: string;
    orders?: number;
    totalSpent?: number;
    status: string;
    created?: string;
    createdAt?: string;
}

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function Users() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await api.get('/user/admin/users');
                const data = res.data?.data || [];
                const mapped = (Array.isArray(data) ? data : []).map((u: any) => ({
                    id: String(u.id),
                    name: u.name || '',
                    email: u.email || '',
                    phone: u.phone || '',
                    role: u.role || 'customer',
                    avatar: u.avatar,
                    orders: u.orders || 0,
                    totalSpent: u.totalSpent || 0,
                    status: u.active === false ? 'locked' : 'active',
                    created: u.createdAt ? new Date(u.createdAt).toLocaleDateString('vi-VN') : '',
                }));
                setCustomers(mapped);
            } catch (e) {
                console.error('Failed to fetch users:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const filtered = customers.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
            setCustomers((prev) => prev.filter((c) => c.id !== id));
        }
    };

    const toggleLock = async (id: string) => {
        try {
            await api.put(`/user/admin/users/${id}/status`);
            setCustomers((prev) =>
                prev.map((c) =>
                    c.id === id ? { ...c, status: c.status === 'active' ? 'locked' : 'active' } : c
                )
            );
        } catch (e) {
            console.error('Failed to toggle user status:', e);
            alert('Không thể thay đổi trạng thái. Vui lòng thử lại.');
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Khách hàng',
            render: (item: Customer) => (
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                        {item.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                </div>
            ),
        },
        { key: 'phone', label: 'SĐT' },
        {
            key: 'orders',
            label: 'Đơn hàng',
            sortable: true,
        },
        {
            key: 'totalSpent',
            label: 'Tổng chi tiêu',
            sortable: true,
            render: (item: Customer) => <span className="font-medium">{formatVND(item.totalSpent || 0)}</span>,
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: Customer) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {item.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </span>
            ),
        },
        { key: 'created', label: 'Ngày đăng ký' },
        {
            key: 'actions',
            label: '',
            render: (item: Customer) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => setViewingCustomer(item)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100">
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => toggleLock(item.id)}
                        className={`p-1.5 rounded-lg text-xs font-medium ${item.status === 'active'
                                ? 'text-amber-600 hover:bg-amber-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                    >
                        {item.status === 'active' ? 'Khóa' : 'Mở'}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50">
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    if (loading) return <div className="flex items-center justify-center py-20"><p className="text-gray-400">Đang tải...</p></div>;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Khách hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">{customers.length} khách hàng đã đăng ký</p>
                </div>
            </div>

            <div className="relative w-80 mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm theo tên, email..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
            </div>

            <DataTable columns={columns} data={filtered} />

            {/* Customer detail modal */}
            {viewingCustomer && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingCustomer(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin khách hàng</h3>
                        <div className="flex items-center gap-4 mb-5">
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                                {viewingCustomer.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{viewingCustomer.name}</p>
                                <p className="text-sm text-gray-500">{viewingCustomer.email}</p>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Số điện thoại</span>
                                <span className="font-medium">{viewingCustomer.phone}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Tổng đơn hàng</span>
                                <span className="font-medium">{viewingCustomer.orders}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Tổng chi tiêu</span>
                                <span className="font-semibold text-primary">{formatVND(viewingCustomer.totalSpent || 0)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-gray-100">
                                <span className="text-gray-500">Trạng thái</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${viewingCustomer.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                    {viewingCustomer.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                                </span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-gray-500">Ngày đăng ký</span>
                                <span className="font-medium">{viewingCustomer.created}</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setViewingCustomer(null)}
                            className="w-full mt-5 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
