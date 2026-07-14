import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Copy, Shield, Eye } from 'lucide-react';
import DataTable from '@/components/admin/DataTable';
import RoleBadge from '@/components/admin/rbac/rbac/components/RoleBadge';
import PermissionMatrix from '@/components/admin/rbac/rbac/components/PermissionMatrix';
import { adminRoleService, PERMISSION_GROUPS } from '@/services/admin/rbac.service';
import type { RBACRole } from '@/types/admin.types';

export default function Roles() {
    const navigate = useNavigate();
    const [roles, setRoles] = useState<RBACRole[]>([]);
    const [search, setSearch] = useState('');
    const [showMatrix, setShowMatrix] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
         setIsLoading(true);
         try {
             const res = await adminRoleService.getAll();
             if(res.success && res.data) {
                  setRoles(res.data);
             }
         } catch(error) {
              console.error("Lỗi khi tải vai trò", error);
         } finally {
              setIsLoading(false);
         }
    };

    const filtered = roles.filter(
        (r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.description.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id: string) => {
         try {
             await adminRoleService.delete(id);
             await fetchRoles();
         } catch(error) {
              console.error("Lỗi xóa vai trò", error);
         } finally {
             setDeleteConfirm(null);
         }
    };

    const handleClone = async (role: RBACRole) => {
        try {
            const clonedData = {
                name: `${role.name} (Copy)`,
                description: `Bản sao của ${role.name}`,
                permissions: role.permissions,
                color: role.color,
                isSystem: false,
            };
            await adminRoleService.create(clonedData);
            await fetchRoles();
        } catch(error) {
             console.error("Lỗi nhân bản vai trò", error);
        }
    };

    const columns = [
        {
            key: 'name',
            label: 'Vai trò',
            render: (item: RBACRole) => (
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${item.color || '#6b7280'}15` }}
                    >
                        <Shield size={18} style={{ color: item.color || '#6b7280' }} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <RoleBadge role={item} />
                            {item.isSystem && (
                                <span className="text-[9px] text-gray-400 uppercase tracking-wider">hệ thống</span>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'permissions',
            label: 'Quyền hạn',
            sortable: true,
            render: (item: RBACRole) => (
                <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-xs font-medium rounded-full">
                    {item.permissions.length} quyền
                </span>
            ),
        },
        { key: 'createdAt', label: 'Ngày tạo', sortable: true },
        {
            key: 'actions',
            label: '',
            render: (item: RBACRole) => (
                <div className="flex items-center gap-1">
                    <button onClick={() => navigate(`/admin/roles/${item.id}/edit`)} className="p-1.5 text-gray-400 hover:text-brand-primary rounded-lg hover:bg-gray-100" title="Sửa">
                        <Edit size={16} />
                    </button>
                    <button onClick={() => handleClone(item)} className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Nhân bản">
                        <Copy size={16} />
                    </button>
                    {!item.isSystem && (
                        <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50" title="Xóa">
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Phân quyền</h1>
                    <p className="text-sm text-gray-500 mt-1">{roles.length} vai trò</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowMatrix(!showMatrix)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${showMatrix ? 'bg-brand-primary text-white border-brand-primary' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        <Eye size={16} /> Ma trận quyền
                    </button>
                    <button
                        onClick={() => navigate('/admin/roles/create')}
                        className="flex items-center gap-2 px-4 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 transition-colors shadow-md shadow-brand-primary/20"
                    >
                        <Plus size={16} /> Tạo vai trò
                    </button>
                </div>
            </div>

            {/* Permission Matrix */}
            {showMatrix && (
                <div className="mb-6">
                    <PermissionMatrix groups={PERMISSION_GROUPS} roles={roles} />
                </div>
            )}

            {/* Search */}
            <div className="relative w-80 mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm vai trò..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                />
            </div>

            <DataTable columns={columns as any} data={filtered as any} />

            {/* Empty state */}
            {filtered.length === 0 && !isLoading && (
                <div className="text-center py-12 text-gray-400">
                    <Shield size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Không tìm thấy vai trò nào</p>
                </div>
            )}
            
            {/* Loading state */}
            {isLoading && (
                 <div className="text-center py-12 text-gray-400">
                     <p className="text-sm">Đang tải dữ liệu...</p>
                 </div>
            )}

            {/* Delete confirmation */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
                    <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận xóa</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Bạn có chắc muốn xóa vai trò này? Hành động không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                                Hủy
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600">
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
