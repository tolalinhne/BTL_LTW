import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <AppRoutes />
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}
