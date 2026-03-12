import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';
import PermissionTree from '@/components/admin/rbac/rbac/components/PermissionTree';
import { MOCK_ROLES, PERMISSION_GROUPS } from '@/services/admin/rbac.service';

export default function RoleForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = !id;

    const existingRole = id ? MOCK_ROLES.find((r) => r.id === id) : null;

    const [name, setName] = useState(existingRole?.name || '');
    const [description, setDescription] = useState(existingRole?.description || '');
    const [color, setColor] = useState(existingRole?.color || '#6b7280');
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(existingRole?.permissions || []);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const isSystem = existingRole?.isSystem || false;

    const validate = () => {
        const errs: Record<string, string> = {};
        if (!name.trim()) errs.name = 'Tên vai trò không được để trống';
        if (!description.trim()) errs.description = 'Mô tả không được để trống';
        if (selectedPermissions.length === 0) errs.permissions = 'Phải chọn ít nhất 1 quyền';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSaving(true);
        await new Promise((r) => setTimeout(r, 1000));
        navigate('/admin/roles');
    };

    const PRESET_COLORS = ['#dc2626', '#7c3aed', '#2563eb', '#059669', '#d97706', '#ec4899', '#6b7280'];

    return (
        <div className="max-w-4xl mx-auto">
            <button onClick={() => navigate('/admin/roles')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-4 transition-colors">
                <ArrowLeft size={16} /> Quay lại
            </button>

            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {isNew ? 'Tạo vai trò mới' : `Chỉnh sửa: ${existingRole?.name}`}
            </h1>

            {/* System role warning */}
            {isSystem && (
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                    <AlertTriangle size={20} className="text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-semibold text-amber-700">Vai trò hệ thống</p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Đây là vai trò mặc định của hệ thống. Thay đổi có thể ảnh hưởng đến hoạt động.
                        </p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-semibold text-gray-900">Thông tin vai trò</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tên vai trò *</label>
                                <input
                                    value={name}
                                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
                                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    placeholder="Ví dụ: Nhân viên Kho"
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả *</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: '' })); }}
                                    rows={3}
                                    className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200'
                                        }`}
                                    placeholder="Mô tả vai trò..."
                                />
                                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Màu nhận diện</label>
                                <div className="flex items-center gap-2">
                                    {PRESET_COLORS.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => setColor(c)}
                                            className={`w-7 h-7 rounded-full border-2 transition-transform ${color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'
                                                }`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sticky save */}
                        <div className="sticky bottom-4">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                            >
                                <Save size={16} /> {isSaving ? 'Đang lưu...' : 'Lưu vai trò'}
                            </button>
                        </div>
                    </div>

                    {/* Right: Permissions */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                            {errors.permissions && (
                                <p className="text-xs text-red-500 mb-3 font-medium">{errors.permissions}</p>
                            )}
                            <PermissionTree
                                groups={PERMISSION_GROUPS}
                                selected={selectedPermissions}
                                onChange={(perms) => { setSelectedPermissions(perms); setErrors((p) => ({ ...p, permissions: '' })); }}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
