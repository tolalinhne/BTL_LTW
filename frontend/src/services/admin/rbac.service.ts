import type { PermissionGroup, RBACRole, StaffUser } from '@/types/admin.types';
import api from '@/services/api';

// ===== PERMISSIONS =====
export const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        id: 'user',
        name: 'Quản lý người dùng',
        permissions: [
            { id: 'u1', key: 'user.view', label: 'Xem danh sách' },
            { id: 'u2', key: 'user.create', label: 'Tạo người dùng' },
            { id: 'u3', key: 'user.edit', label: 'Sửa thông tin' },
            { id: 'u4', key: 'user.delete', label: 'Xóa người dùng', danger: true },
            { id: 'u5', key: 'user.role', label: 'Phân quyền', danger: true },
        ],
    },
    {
        id: 'product',
        name: 'Quản lý sản phẩm',
        permissions: [
            { id: 'p1', key: 'product.view', label: 'Xem sản phẩm' },
            { id: 'p2', key: 'product.create', label: 'Thêm sản phẩm' },
            { id: 'p3', key: 'product.update', label: 'Sửa sản phẩm' },
            { id: 'p4', key: 'product.delete', label: 'Xóa sản phẩm', danger: true },
        ],
    },
    {
        id: 'order',
        name: 'Quản lý đơn hàng',
        permissions: [
            { id: 'o1', key: 'order.view', label: 'Xem đơn hàng' },
            { id: 'o2', key: 'order.update', label: 'Cập nhật trạng thái' },
            { id: 'o3', key: 'order.cancel', label: 'Hủy đơn hàng', danger: true },
            { id: 'o4', key: 'order.refund', label: 'Hoàn tiền', danger: true },
        ],
    },
    {
        id: 'category',
        name: 'Quản lý danh mục',
        permissions: [
            { id: 'c1', key: 'category.view', label: 'Xem danh mục' },
            { id: 'c2', key: 'category.create', label: 'Tạo danh mục' },
            { id: 'c3', key: 'category.edit', label: 'Sửa danh mục' },
            { id: 'c4', key: 'category.delete', label: 'Xóa danh mục', danger: true },
        ],
    },
    {
        id: 'statistics',
        name: 'Thống kê & Báo cáo',
        permissions: [
            { id: 's1', key: 'stats.view', label: 'Xem thống kê' },
            { id: 's2', key: 'stats.export', label: 'Xuất báo cáo' },
        ],
    },
    {
        id: 'blog',
        name: 'Quản lý Blog',
        permissions: [
            { id: 'b1', key: 'blog.view', label: 'Xem bài viết' },
            { id: 'b2', key: 'blog.create', label: 'Tạo bài viết' },
            { id: 'b3', key: 'blog.edit', label: 'Sửa bài viết' },
            { id: 'b4', key: 'blog.delete', label: 'Xóa bài viết', danger: true },
            { id: 'b5', key: 'blog.publish', label: 'Xuất bản' },
        ],
    },
    {
        id: 'settings',
        name: 'Cài đặt hệ thống',
        permissions: [
            { id: 'st1', key: 'settings.view', label: 'Xem cài đặt' },
            { id: 'st2', key: 'settings.edit', label: 'Thay đổi cài đặt', danger: true },
        ],
    },
];

export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));

// ===== ROLES INTERFACE =====
export const adminRoleService = {
     getAll: async (): Promise<RBACRole[]> => {
         const res = await api.get('/admin/roles');
         return res.data?.data;
     },
     getById: async (id: string): Promise<RBACRole> => {
          const res = await api.get(`/admin/roles/${id}`);
          return res.data?.data;
     },
     create: async (data: Partial<RBACRole>): Promise<RBACRole> => {
          const res = await api.post('/admin/roles', data);
          return res.data?.data;
     },
     update: async (id: string, data: Partial<RBACRole>): Promise<RBACRole> => {
          const res = await api.put(`/admin/roles/${id}`, data);
          return res.data?.data;
     },
     delete: async (id: string): Promise<void> => {
          await api.delete(`/admin/roles/${id}`);
     }
};


// ===== STAFF INTERFACE =====
export const adminStaffService = {
     getAll: async (params?: Record<string, string | number>) => {
          const res = await api.get('/admin/staff', { params });
          return res.data?.data;
     },
     getById: async (id: string): Promise<StaffUser> => {
          const res = await api.get(`/admin/staff/${id}`);
          return res.data?.data;
     },
     create: async (data: Partial<StaffUser>): Promise<StaffUser> => {
          const res = await api.post('/admin/staff', data);
          return res.data?.data;
     },
     update: async (id: string, data: Partial<StaffUser>): Promise<StaffUser> => {
          const res = await api.put(`/admin/staff/${id}`, data);
          return res.data?.data;
     },
     updateStatus: async (id: string, status: string): Promise<void> => {
          await api.put(`/admin/staff/${id}/status`, { status });
     },
     delete: async (id: string): Promise<void> => {
          await api.delete(`/admin/staff/${id}`);
     }
};
