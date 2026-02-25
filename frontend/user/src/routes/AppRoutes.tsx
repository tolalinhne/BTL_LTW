import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '@/pages/Home';
import ProductList from '@/pages/ProductList';
import ProductDetail from '@/pages/ProductDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Protected pages
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import Profile from '@/pages/Profile';
import OrderHistory from '@/pages/OrderHistory';

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:category" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            </Route>
        </Routes>
    );
}
