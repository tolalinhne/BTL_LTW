import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { Product } from '@/types/user.types';

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<Product[]>(() => {
        try {
            const stored = localStorage.getItem('lili_wishlist');
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    });

    const addToWishlist = useCallback((product: Product) => {
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            const next = [...prev, product];
            localStorage.setItem('lili_wishlist', JSON.stringify(next));
            return next;
        });
    }, []);

    const removeFromWishlist = useCallback((productId: string) => {
        setWishlist((prev) => {
            const next = prev.filter((p) => p.id !== productId);
            localStorage.setItem('lili_wishlist', JSON.stringify(next));
            return next;
        });
    }, []);

    const isInWishlist = useCallback(
        (productId: string) => wishlist.some((p) => p.id === productId),
        [wishlist]
    );

    const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};
