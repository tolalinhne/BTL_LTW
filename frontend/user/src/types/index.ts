// ===== Product =====
export interface Product {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    colors: string[];
    sizes?: string[];
    description?: string;
    isNew?: boolean;
    isBestSeller?: boolean;
    isSale?: boolean;
    discount?: number;
}

// ===== Cart =====
export interface CartItem extends Product {
    quantity: number;
    selectedSize: string;
    selectedColor: string;
}

// ===== User / Auth =====
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    address?: string;
    role: 'customer' | 'staff' | 'admin';
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

// ===== Order =====
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

// ===== Category =====
export interface Category {
    id: string;
    name: string;
    icon: string;
    slug: string;
}

// ===== Review =====
export interface Review {
    id: string;
    userName: string;
    rating: number; // 1-5
    comment: string;
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
