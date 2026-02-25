import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '@/pages/Home';
import ProductList from '@/pages/ProductList';
import ProductDetail from '@/pages/ProductDetail';
import SaleOff from '@/pages/SaleOff';
import StoreList from '@/pages/StoreList';
import StoreDetail from '@/pages/StoreDetail';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

// Public + semi-public pages
import Cart from '@/pages/Cart';

// Protected pages
import Checkout from '@/pages/Checkout';
import OrderSuccess from '@/pages/OrderSuccess';
import Profile from '@/pages/Profile';
import OrderHistory from '@/pages/OrderHistory';
import Wishlist from '@/pages/Wishlist';

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<MainLayout />}>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:category" element={<ProductList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/saleoff" element={<SaleOff />} />
                <Route path="/saleoff/:category" element={<SaleOff />} />
                <Route path="/store" element={<StoreList />} />
                <Route path="/store/:id" element={<StoreDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />

                {/* Protected routes */}
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
            </Route>
        </Routes>
    );
}

