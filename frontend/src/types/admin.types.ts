import type { Role, Product as BaseProduct, Category as BaseCategory, Order } from './shared.types';

// Re-export shared types for convenience
export type { User, AuthResponse, ApiResponse, PaginatedResponse, Role, Order } from './shared.types';

// ===== Admin Product (extended) =====
export interface AdminProduct extends BaseProduct {
    stock: number;
    status: 'active' | 'draft' | 'archived';
    createdAt: string;
}

// ===== Admin Category (extended) =====
export interface AdminCategory extends BaseCategory {
    productCount: number;
}

// ===== Admin Order (extended) =====
export interface AdminOrder {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    itemCount: number;
    createdAt: string;
}

// ===== Customer =====
export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    totalOrders: number;
    totalSpent: number;
    createdAt: string;
}

// ===== Stats =====
export interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenueGrowth: number;
    orderGrowth: number;
}

// ===== Menu =====
export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    roles: Role[];
}

// ===== Table =====
export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}

// ===== Blog (Admin-side, simplified) =====
export type BlogPost = AdminBlogPost;
export interface AdminBlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    category: string;
    author: string;
    tags: string[];
    status: 'draft' | 'published';
    publishedAt: string;
    createdAt: string;
}

export interface BlogFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    category: string;
    tags: string[];
    status: 'draft' | 'published';
}

// ===== RBAC =====
export interface Permission {
    id: string;
    key: string;
    label: string;
    description?: string;
    danger?: boolean;
}

export interface PermissionGroup {
    id: string;
    name: string;
    permissions: Permission[];
}

export interface RBACRole {
    id: string;
    name: string;
    description: string;
    permissions: string[];
    isSystem?: boolean;
    color?: string;
    createdAt: string;
}

export interface StaffUser {
    id: string;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    roleId: string;
    status: 'active' | 'locked';
    createdAt: string;
}
