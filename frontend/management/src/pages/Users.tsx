import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Shield, User } from 'lucide-react';
import DataTable from '@/components/DataTable';
import FormModal from '@/components/FormModal';

const MOCK_USERS = [
    { id: '1', name: 'Nguyễn Thị A', email: 'a@mail.com', phone: '0912345678', role: 'customer', orders: 12, totalSpent: 8500000, created: '01/01/2026' },
    { id: '2', name: 'Trần Văn B', email: 'b@mail.com', phone: '0987654321', role: 'customer', orders: 5, totalSpent: 3200000, created: '15/01/2026' },
    { id: '3', name: 'Staff User', email: 'staff@lilifashion.vn', phone: '0911111111', role: 'staff', orders: 0, totalSpent: 0, created: '01/12/2025' },
    { id: '4', name: 'Admin User', email: 'admin@lilifashion.vn', phone: '0900000000', role: 'admin', orders: 0, totalSpent: 0, created: '01/11/2025' },
];

const ROLE_STYLES: Record<string, string> = {
    customer: 'bg-blue-100 text-blue-700',
    staff: 'bg-purple-100 text-purple-700',
    admin: 'bg-red-100 text-red-700',
};

const formatVND = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function Users() {
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filtered = MOCK_USERS.filter((u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    );

    const columns = [
        {
            key: 'name',
            label: 'Người dùng',
            render: (item: (typeof MOCK_USERS)[0]) => (
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
            key: 'role',
            label: 'Vai trò',
            render: (item: (typeof MOCK_USERS)[0]) => (
                <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${ROLE_STYLES[item.role]}`}>
                    {item.role === 'admin' ? <Shield size={10} /> : <User size={10} />}
                    {item.role === 'customer' ? 'Khách hàng' : item.role === 'staff' ? 'Nhân viên' : 'Admin'}
                </span>
            ),
        },
        {
            key: 'orders',
            label: 'Đơn hàng',
            sortable: true,
        },
        {
            key: 'totalSpent',
            label: 'Tổng chi',
            sortable: true,
            render: (item: (typeof MOCK_USERS)[0]) => <span className="font-medium">{formatVND(item.totalSpent)}</span>,
        },
        { key: 'created', label: 'Ngày tạo' },
        {
            key: 'actions',
            label: '',
            render: () => (
                <div className="flex items-center gap-1">
                    <button className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100"><Edit size={16} /></button>
                    <button className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
                    <p className="text-sm text-gray-500 mt-1">{MOCK_USERS.length} người dùng</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                    <Plus size={16} /> Thêm người dùng
                </button>
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

            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Thêm người dùng"
                onSubmit={() => setIsModalOpen(false)}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                        <input className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option value="customer">Khách hàng</option>
                            <option value="staff">Nhân viên</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </FormModal>
        </div>
    );
}
