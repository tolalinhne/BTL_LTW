import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ChatProvider } from './contexts/ChatContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <WishlistProvider>
                    <ChatProvider>
                        <AppRoutes />
                    </ChatProvider>
                </WishlistProvider>
            </CartProvider>
        </AuthProvider>
    );
}
