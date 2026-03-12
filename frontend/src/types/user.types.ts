import type { Product as BaseProduct, Category } from './shared.types';

// Re-export all shared types for convenience
export type { User, LoginCredentials, RegisterData, AuthResponse, Order, OrderItem, ApiResponse, PaginatedResponse, Category, Role, Address } from './shared.types';

// ===== User Product (extended) =====
export interface Product extends BaseProduct {
    colors: string[];
    sizes?: string[];
    description?: string;
    detailedDescription?: string;
    stock?: number;
    soldCount?: number;
    rating?: number;
    createdAt?: string;
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

// ===== User Category (extended) =====
export interface UserCategory extends Category {
    icon: string;
}

// ===== Review =====
export interface Review {
    id: string;
    userName: string;
    rating: number; // 1-5
    comment: string;
    createdAt: string;
}

// ===== Chat / AI Assistant =====
export interface ChatProduct {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'bot';
    content: string;
    products?: ChatProduct[];
    references?: string[];
    timestamp: number;
}

export interface ChatApiResponse {
    reply: string;
    recommendedProducts: ChatProduct[];
    references?: string[];
}

// ===== Blog (User-side, rich version) =====
export interface BlogAuthor {
    name: string;
    avatar: string;
    role?: string;
}

export interface BlogCategory {
    id: string;
    name: string;
    slug: string;
}

export type BlogPost = UserBlogPost;
export interface UserBlogPost {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    category: BlogCategory;
    author: BlogAuthor;
    tags: string[];
    status: 'draft' | 'published';
    publishedAt: string;
    createdAt: string;
    readingTime: number;
}
