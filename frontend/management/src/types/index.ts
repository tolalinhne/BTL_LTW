export type Role = 'staff' | 'admin';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatar?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface MenuItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    roles: Role[];  // which roles can see this menu item
}

// ===== Product =====
export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    stock: number;
    status: 'active' | 'draft' | 'archived';
    createdAt: string;
}

// ===== Category =====
export interface Category {
    id: string;
    name: string;
    slug: string;
    productCount: number;
}

// ===== Order =====
export interface Order {
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

// ===== Table =====
export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (item: T) => React.ReactNode;
}
