import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <AppRoutes />
            </CartProvider>
        </AuthProvider>
    );
}
