import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { CartItem, Product } from '@/types/user.types';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/services/api';

interface CartContextType {
    cart: CartItem[];
    addToCart: (product: Product, quantity: number, size: string, color: string) => void;
    removeFromCart: (id: string, size: string, color: string) => void;
    updateQuantity: (id: string, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    syncCart: () => Promise<void>;
    subtotal: number;
    itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, user, isLoading: authLoading } = useAuth();
    const [cart, setCart] = useState<CartItem[]>(() => {
        try {
            const stored = localStorage.getItem('lili_cart');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    // Sync cart when authentication status changes
    // Wait for AuthContext to finish restoring token to avoid 401 on page reload
    useEffect(() => {
        if (authLoading) return; // Chờ AuthContext khôi phục token xong

        if (isAuthenticated) {
            fetchCartFromDB();
        } else {
            try {
                const stored = localStorage.getItem('lili_cart');
                setCart(stored ? JSON.parse(stored) : []);
            } catch {
                setCart([]);
            }
        }
    }, [isAuthenticated, authLoading]);

    const fetchCartFromDB = async () => {
         try {
             const res = await api.get('/cart');
             const data = res.data?.data;
             if (data?.items) {
                 // Map BE cart items to FE CartItem format
                 const mappedItems: CartItem[] = data.items.map((item: any) => ({
                     id: String(item.productId),
                     name: item.productName,
                     image: item.productImage || '',
                     price: item.price,
                     category: '',
                     colors: [],
                     quantity: item.quantity,
                     selectedSize: item.size || '',
                     selectedColor: item.color || '',
                 }));
                 setCart(mappedItems);
             }
         } catch (error) {
             console.error('Lỗi khi tải giỏ hàng:', error);
         }
    };

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

        // Sync to backend if authenticated — phải gửi variantId để backend trừ kho đúng
        if (isAuthenticated) {
            // Tìm variantId từ product.variants dựa vào size + color
            const matchedVariant = (product as any).variants?.find(
                (v: any) => v.size === size && v.color === color
            );
            const variantId: number | null = matchedVariant?.id ?? null;

            api.post('/cart/items', {
                productId: Number(product.id),
                variantId,
                quantity,
            }).catch((err) => console.error('Lỗi sync cart item:', err));
        }
    }, [isAuthenticated]);

    const removeFromCart = useCallback((id: string, size: string, color: string) => {
        setCart((prev) => {
            const next = prev.filter(
                (item) => !(item.id === id && item.selectedSize === size && item.selectedColor === color)
            );
            localStorage.setItem('lili_cart', JSON.stringify(next));
            return next;
        });

        // Sync removal to backend if authenticated
        if (isAuthenticated) {
            api.delete(`/cart/items/${id}`).catch((err) => console.error('Lỗi xóa cart item:', err));
        }
    }, [isAuthenticated]);

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
        // Clear backend cart if authenticated
        if (isAuthenticated) {
            api.delete('/cart').catch((err) => console.error('Lỗi clear cart:', err));
        }
    }, [isAuthenticated]);

    const syncCart = async () => {
         try {
             const localCartSt = localStorage.getItem('lili_cart');
             let localCart: CartItem[] = [];
             if (localCartSt) {
                 localCart = JSON.parse(localCartSt);
             }
             
             if(localCart.length > 0) {
                 // Add each local item to backend cart
                 for (const item of localCart) {
                     try {
                         await api.post('/cart/items', {
                             productId: Number(item.id),
                             quantity: item.quantity,
                         });
                     } catch { /* ignore individual item errors */ }
                 }
                 localStorage.removeItem('lili_cart');
             }

             // Then fetch the merged cart
             await fetchCartFromDB();

         } catch (error) {
              console.error('Lỗi khi đồng bộ giỏ hàng:', error);
         }
    };

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);
    const itemCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, syncCart, subtotal, itemCount }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
