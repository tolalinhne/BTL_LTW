// ===== Roles =====
export type Role = 'customer' | 'staff' | 'admin';

// ===== User / Auth =====
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    role: Role;
    avatar?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

export interface AuthResponse {
    user: User;
    token: string;
}

// ===== Product (base) =====
export interface Product {
    id: string;
    name: string;
    sku?: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
}

// ===== Category (base) =====
export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

// ===== Address =====
export interface Address {
    id: string;
    name: string;
    phone: string;
    address: string;
    isDefault: boolean;
}

// ===== Order (base) =====
export interface OrderItem {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled';
    shippingAddress: string;
    customerName: string;
    customerPhone: string;
    paymentMethod: string;
    createdAt: string;
}

// ===== API Response =====
export interface ApiResponse<T> {
    data: T;
    message: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}
