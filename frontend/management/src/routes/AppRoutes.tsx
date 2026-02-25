import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import EditProduct from '@/pages/EditProduct';
import Categories from '@/pages/Categories';
import Orders from '@/pages/Orders';
import Users from '@/pages/Users';
import Statistics from '@/pages/Statistics';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            {/* Protected admin layout */}
            <Route
                element={
                    <ProtectedRoute>
                        <AdminLayout />
                    </ProtectedRoute>
                }
            >
                {/* STAFF + ADMIN */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />

                {/* ADMIN only */}
                <Route path="/products" element={<ProtectedRoute allowedRoles={['admin']}><Products /></ProtectedRoute>} />
                <Route path="/products/new" element={<ProtectedRoute allowedRoles={['admin']}><EditProduct /></ProtectedRoute>} />
                <Route path="/products/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><EditProduct /></ProtectedRoute>} />
                <Route path="/categories" element={<ProtectedRoute allowedRoles={['admin']}><Categories /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>} />
                <Route path="/statistics" element={<ProtectedRoute allowedRoles={['admin']}><Statistics /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
