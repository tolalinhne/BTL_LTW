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
    permissions?: string[];
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
    accessToken: string;
    refreshToken: string;
    user: User;
}

// ===== Product (base) =====
export interface Product {
    id: string;
    name: string;
    slug?: string;
    sku?: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    variants?: { color: string; colorHex?: string; size: string; stock: number }[];
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
    productImage?: string;
    image?: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
}

export interface OrderShippingAddress {
    fullName: string;
    phone: string;
    street: string;
    ward: string;
    district: string;
    city: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    subTotal: number;
    shippingFee: number;
    discountAmount: number;
    totalAmount: number;
    status: 'pending' | 'processing' | 'confirmed' | 'shipping' | 'delivered' | 'cancelled' | 'refunded';
    shippingAddress: OrderShippingAddress;
    paymentMethod: string;
    note?: string;
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
