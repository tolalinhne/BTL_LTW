import React from 'react';
import { Route } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '@/pages/user/Home';
import ProductList from '@/pages/user/ProductList';
import ProductDetail from '@/pages/user/ProductDetail';
import SaleOff from '@/pages/user/SaleOff';
import StoreList from '@/pages/user/StoreList';
import StoreDetail from '@/pages/user/StoreDetail';
import BlogListPage from '@/pages/user/BlogListPage';
import BlogDetailPage from '@/pages/user/BlogDetailPage';
import Login from '@/pages/user/Login';
import Register from '@/pages/user/Register';
import Cart from '@/pages/user/Cart';

// Protected pages
import Checkout from '@/pages/user/Checkout';
import OrderSuccess from '@/pages/user/OrderSuccess';
import Profile from '@/pages/user/Profile';
import OrderHistory from '@/pages/user/OrderHistory';
import Wishlist from '@/pages/user/Wishlist';

export default function UserRoutes() {
    return (
        <Route element={<MainLayout />}>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/:category" element={<ProductList />} />
            <Route path="/product/:slug" element={<ProductDetail />} />
            <Route path="/saleoff" element={<SaleOff />} />
            <Route path="/saleoff/:category" element={<SaleOff />} />
            <Route path="/store" element={<StoreList />} />
            <Route path="/store/:id" element={<StoreDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/blog" element={<BlogListPage />} />
            <Route path="/blog/:slug" element={<BlogDetailPage />} />

            {/* Protected routes */}
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/order-success" element={<ProtectedRoute><OrderSuccess /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
        </Route>
    );
}
