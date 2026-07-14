import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { ChatProvider } from './contexts/ChatContext';
import { SaleProvider } from './contexts/SaleContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
    return (
        <AuthProvider>
            <SaleProvider>
                <CartProvider>
                    <WishlistProvider>
                        <ChatProvider>
                            <AppRoutes />
                        </ChatProvider>
                    </WishlistProvider>
                </CartProvider>
            </SaleProvider>
        </AuthProvider>
    );
}
