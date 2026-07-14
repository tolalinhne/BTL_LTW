import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import type { Product } from '@/types/user.types';
import { useAuth } from '@/contexts/AuthContext';
import { wishlistService } from '@/services/wishlist.service';

interface WishlistContextType {
    wishlist: Product[];
    addToWishlist: (product: Product) => void;
    removeFromWishlist: (productId: string) => void;
    isInWishlist: (productId: string) => boolean;
    wishlistCount: number;
    isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch wishlist from backend or local storage depending on auth status
    // Wait for AuthContext to finish restoring token before fetching
    useEffect(() => {
        if (authLoading) return; // Chờ AuthContext khôi phục token xong

        const fetchWishlist = async () => {
            setIsLoading(true);
            if (isAuthenticated) {
                const dbWishlist = await wishlistService.getWishlist();
                setWishlist(dbWishlist);

                // Optionally sync local to DB here if we wanted to
                // const localStr = localStorage.getItem('lili_wishlist');
                // if (localStr) { ... sync logic ... localStorage.removeItem('lili_wishlist'); }
            } else {
                try {
                    const stored = localStorage.getItem('lili_wishlist');
                    if (stored) setWishlist(JSON.parse(stored));
                    else setWishlist([]);
                } catch {
                    setWishlist([]);
                }
            }
            setIsLoading(false);
        };
        fetchWishlist();
    }, [isAuthenticated, authLoading]);

    const addToWishlist = useCallback(async (product: Product) => {
        // Optimistic update
        setWishlist((prev) => {
            if (prev.some((p) => p.id === product.id)) return prev;
            const next = [...prev, product];
            if (!isAuthenticated) localStorage.setItem('lili_wishlist', JSON.stringify(next));
            return next;
        });

        if (isAuthenticated) {
            await wishlistService.addToWishlist(product.id);
        }
    }, [isAuthenticated]);

    const removeFromWishlist = useCallback(async (productId: string) => {
        // Optimistic update
        setWishlist((prev) => {
            const next = prev.filter((p) => p.id !== productId);
            if (!isAuthenticated) localStorage.setItem('lili_wishlist', JSON.stringify(next));
            return next;
        });

        if (isAuthenticated) {
            await wishlistService.removeFromWishlist(productId);
        }
    }, [isAuthenticated]);

    const isInWishlist = useCallback(
        (productId: string) => wishlist.some((p) => p.id === productId),
        [wishlist]
    );

    const wishlistCount = useMemo(() => wishlist.length, [wishlist]);

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount, isLoading }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
    return context;
};
