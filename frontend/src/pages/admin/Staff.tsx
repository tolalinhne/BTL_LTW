import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Lock, Unlock, Trash2, UserCog } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import FormModal from '@/components/admin/FormModal';
import RoleBadge from '@/components/admin/rbac/rbac/components/RoleBadge';
import { MOCK_STAFF, MOCK_ROLES, getRoleById } from '@/services/admin/rbac.service';
import type { StaffUser, RBACRole } from '@/types/admin.types';

export default function Staff() {
    const navigate = useNavigate();
    const [staff, setStaff] = useState(MOCK_STAFF);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);

    // Form
    const [formName, setFormName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [formPassword, setFormPassword] = useState('');
    const [formRoleId, setFormRoleId] = useState(MOCK_ROLES[2]?.id || '');
    const [formStatus, setFormStatus] = useState<'active' | 'locked'>('active');
    const [hoveredRole, setHoveredRole] = useState<RBACRole | null>(null);

    const filtered = staff.filter(
        (s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase())
    );

    const openCreate = () => {
        setEditingStaff(null);
        setFormName('');
        setFormEmail('');
        setFormPhone('');
        setFormPassword('');
        setFormRoleId(MOCK_ROLES[2]?.id || '');
        setFormStatus('active');
        setIsModalOpen(true);
    };

    const openEdit = (s: StaffUser) => {
        setEditingStaff(s);
        setFormName(s.name);
        setFormEmail(s.email);
        setFormPhone(s.phone);
        setFormPassword('');
        setFormRoleId(s.roleId);
        setFormStatus(s.status);
        setIsModalOpen(true);
    };

    const handleSubmit = () => {
        if (!formName.trim() || !formEmail.trim()) return;
        if (editingStaff) {
            setStaff((prev) =>
                prev.map((s) =>
                    s.id === editingStaff.id
                        ? { ...s, name: formName, email: formEmail, phone: formPhone, roleId: formRoleId, status: formStatus }
                        : s
                )
            );
        } else {
            setStaff((prev) => [
                ...prev,
                {
                    id: String(Date.now()),
                    name: formName,
                    email: formEmail,
                    phone: formPhone,
                    roleId: formRoleId,
                    status: formStatus,
                    createdAt: new Date().toLocaleDateString('vi-VN'),
                },
            ]);
        }
        setIsModalOpen(false);
    };

    const toggleLock = (id: string) => {
        setStaff((prev) =>
            prev.map((s) =>
                s.id === id ? { ...s, status: s.status === 'active' ? 'locked' : 'active' } : s
            )
        );
    };

    const handleDelete = (id: string) => {
        if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
            setStaff((prev) => prev.filter((s) => s.id !== id));
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Nhân viên',
            render: (item: StaffUser) => (
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
            key: 'roleId',
            label: 'Vai trò',
            render: (item: StaffUser) => {
                const role = getRoleById(item.roleId);
                return role ? <RoleBadge role={role} /> : <span className="text-gray-400 text-xs">—</span>;
            },
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: StaffUser) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {item.status === 'active' ? 'Hoạt động' : 'Đã khóa'}
                </span>
            ),
        },
        { key: 'createdAt', label: 'Ngày tạo' },
        {
            key: 'actions',
            label: '',
            render: (item: StaffUser) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg hover:bg-gray-100" title="Sửa">
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => toggleLock(item.id)}
                        className={`p-1.5 rounded-lg ${item.status === 'active'
                            ? 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                            }`}
                        title={item.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    >
                        {item.status === 'active' ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50" title="Xóa">
                        <Trash2 size={16} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhân viên</h1>
                    <p className="text-sm text-gray-500 mt-1">{staff.length} nhân viên</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
                >
                    <Plus size={16} /> Thêm nhân viên
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

            <DataTable columns={columns as any} data={filtered as any} />

            {/* Empty */}
            {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                    <UserCog size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Không tìm thấy nhân viên nào</p>
                </div>
            )}

            {/* Create / Edit Modal */}
            <FormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
                onSubmit={handleSubmit}
                submitLabel={editingStaff ? 'Cập nhật' : 'Tạo mới'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                        <input value={formName} onChange={(e) => setFormName(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="Nhập họ tên..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="email@lilifashion.vn" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                        <input type="tel" value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="0900000000" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editingStaff ? 'Đổi mật khẩu' : 'Mật khẩu *'}
                        </label>
                        <input type="password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder={editingStaff ? 'Để trống nếu không đổi' : 'Nhập mật khẩu...'} />
                        {editingStaff && (
                            <p className="text-xs text-gray-400 mt-1">Bỏ trống nếu không muốn thay đổi mật khẩu</p>
                        )}
                    </div>
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò *</label>
                        <select
                            value={formRoleId}
                            onChange={(e) => setFormRoleId(e.target.value)}
                            onMouseLeave={() => setHoveredRole(null)}
                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            {MOCK_ROLES.map((r) => (
                                <option key={r.id} value={r.id}>{r.name}</option>
                            ))}
                        </select>
                        {/* Role description */}
                        {(() => {
                            const selectedRole = getRoleById(formRoleId);
                            return selectedRole ? (
                                <p className="text-xs text-gray-400 mt-1">
                                    {selectedRole.description} — <span className="font-medium text-primary">{selectedRole.permissions.length} quyền</span>
                                </p>
                            ) : null;
                        })()}
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                            <p className="text-sm font-medium text-gray-700">Trạng thái</p>
                            <p className="text-xs text-gray-500">{formStatus === 'active' ? 'Tài khoản hoạt động' : 'Tài khoản bị khóa'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormStatus(formStatus === 'active' ? 'locked' : 'active')}
                            className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${formStatus === 'active' ? 'bg-green-500' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-1 ${formStatus === 'active' ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </FormModal>
        </div>
    );
}
