import type { PermissionGroup, RBACRole, StaffUser } from '@/types/admin.types';

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

const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap((g) => g.permissions.map((p) => p.key));

// ===== ROLES =====
export const MOCK_ROLES: RBACRole[] = [
    {
        id: 'superadmin',
        name: 'SuperAdmin',
        description: 'Toàn quyền hệ thống, không bị giới hạn',
        permissions: ALL_PERMISSION_KEYS,
        isSystem: true,
        color: '#dc2626',
        createdAt: '01/11/2025',
    },
    {
        id: 'admin',
        name: 'Admin',
        description: 'Quản trị viên — quản lý sản phẩm, đơn hàng, người dùng',
        permissions: ALL_PERMISSION_KEYS.filter((k) => !k.startsWith('settings.')),
        isSystem: true,
        color: '#7c3aed',
        createdAt: '01/11/2025',
    },
    {
        id: 'staff-order',
        name: 'Nhân viên Đơn hàng',
        description: 'Xử lý và quản lý đơn hàng',
        permissions: ['order.view', 'order.update', 'product.view', 'user.view', 'stats.view'],
        isSystem: false,
        color: '#2563eb',
        createdAt: '15/01/2026',
    },
    {
        id: 'staff-content',
        name: 'Nhân viên Nội dung',
        description: 'Quản lý blog và sản phẩm',
        permissions: ['blog.view', 'blog.create', 'blog.edit', 'blog.publish', 'product.view', 'product.create', 'product.update', 'category.view'],
        isSystem: false,
        color: '#059669',
        createdAt: '20/01/2026',
    },
];

// ===== STAFF =====
export const MOCK_STAFF: StaffUser[] = [
    { id: '1', name: 'Admin User', email: 'admin@lilifashion.vn', phone: '0900000000', roleId: 'superadmin', status: 'active', createdAt: '01/11/2025' },
    { id: '2', name: 'Nguyễn Văn Quản', email: 'quan@lilifashion.vn', phone: '0911111111', roleId: 'admin', status: 'active', createdAt: '01/12/2025' },
    { id: '3', name: 'Trần Thị Hàng', email: 'hang@lilifashion.vn', phone: '0922222222', roleId: 'staff-order', status: 'active', createdAt: '15/01/2026' },
    { id: '4', name: 'Lê Minh Blog', email: 'blog@lilifashion.vn', phone: '0933333333', roleId: 'staff-content', status: 'active', createdAt: '20/01/2026' },
    { id: '5', name: 'Phạm Anh Kho', email: 'kho@lilifashion.vn', phone: '0944444444', roleId: 'staff-order', status: 'locked', createdAt: '01/02/2026' },
];

// ===== Helper =====
export function getRoleById(id: string): RBACRole | undefined {
    return MOCK_ROLES.find((r) => r.id === id);
}
