import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { CartItem, Product } from '@/types/user.types';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity: number, size: string, color: string) => void;
    removeFromCart: (id: string, size: string, color: string) => void;
    updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    subtotal: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('lili_cart');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const addToCart = useCallback((product: Product, quantity: number, size: string, color: string) => {
        setCart((prev) => {
            const existing = prev.find(
                (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
            );
            let next: CartItem[];
            if (existing) {
                next = prev.map((item) =>
                    item.id === product.id && item.selectedSize === size && item.selectedColor === color
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                next = [...prev, { ...product, colors: [], quantity, selectedSize: size, selectedColor: color }];
            }
            localStorage.setItem('lili_cart', JSON.stringify(next));
            return next;
        });
    }, []);

    const removeFromCart = useCallback((id: string, size: string, color: string) => {
        setCart((prev) => {
            const next = prev.filter(
                (item) => !(item.id === id && item.selectedSize === size && item.selectedColor === color)
            );
            localStorage.setItem('lili_cart', JSON.stringify(next));
            return next;
        });
    }, []);

    const updateQuantity = useCallback((id: string, size: string, color: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id, size, color);
            return;
        }
        setCart((prev) => {
            const next = prev.map((item) =>
                item.id === id && item.selectedSize === size && item.selectedColor === color
                    ? { ...item, quantity }
                    : item
            );
            localStorage.setItem('lili_cart', JSON.stringify(next));
            return next;
        });
    }, [removeFromCart]);

    const clearCart = useCallback(() => {
        localStorage.removeItem('lili_cart');
        setCart([]);
    }, []);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
    const itemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, subtotal, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
