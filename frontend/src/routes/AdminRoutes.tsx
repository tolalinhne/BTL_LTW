import React from 'react';
import { Route, Navigate } from 'react-router-dom';
import AdminLayout from '@/layouts/AdminLayout';
import AdminRoute from './AdminRoute';

import AdminLogin from '@/pages/admin/Login';
import Dashboard from '@/pages/admin/Dashboard';
import Products from '@/pages/admin/Products';
import EditProduct from '@/pages/admin/EditProduct';
import Categories from '@/pages/admin/Categories';
import Orders from '@/pages/admin/Orders';
import Users from '@/pages/admin/Users';
import Statistics from '@/pages/admin/Statistics';
import BlogList from '@/pages/admin/BlogList';
import BlogForm from '@/pages/admin/BlogForm';
import Roles from '@/pages/admin/Roles';
import RoleForm from '@/pages/admin/RoleForm';
import Staff from '@/pages/admin/Staff';
import AdminSaleOff from '@/pages/admin/SaleOff';

export default function AdminRoutes() {
    return (
        <Route path="/admin">
            <Route path="login" element={<AdminLogin />} />

            {/* Protected admin layout */}
            <Route
                element={
                    <AdminRoute>
                        <AdminLayout />
                    </AdminRoute>
                }
            >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                {/* STAFF + ADMIN */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />

                {/* ADMIN only */}
                <Route path="products" element={<AdminRoute allowedRoles={['admin']}><Products /></AdminRoute>} />
                <Route path="products/new" element={<AdminRoute allowedRoles={['admin']}><EditProduct /></AdminRoute>} />
                <Route path="products/:id/edit" element={<AdminRoute allowedRoles={['admin']}><EditProduct /></AdminRoute>} />
                <Route path="categories" element={<AdminRoute allowedRoles={['admin']}><Categories /></AdminRoute>} />
                <Route path="users" element={<AdminRoute allowedRoles={['admin']}><Users /></AdminRoute>} />
                <Route path="statistics" element={<AdminRoute allowedRoles={['admin']}><Statistics /></AdminRoute>} />
                <Route path="blog" element={<AdminRoute allowedRoles={['admin']}><BlogList /></AdminRoute>} />
                <Route path="blog/create" element={<AdminRoute allowedRoles={['admin']}><BlogForm /></AdminRoute>} />
                <Route path="blog/:id/edit" element={<AdminRoute allowedRoles={['admin']}><BlogForm /></AdminRoute>} />
                <Route path="roles" element={<AdminRoute allowedRoles={['admin']}><Roles /></AdminRoute>} />
                <Route path="roles/create" element={<AdminRoute allowedRoles={['admin']}><RoleForm /></AdminRoute>} />
                <Route path="roles/:id/edit" element={<AdminRoute allowedRoles={['admin']}><RoleForm /></AdminRoute>} />
                <Route path="staff" element={<AdminRoute allowedRoles={['admin']}><Staff /></AdminRoute>} />
                <Route path="saleoff" element={<AdminRoute allowedRoles={['admin']}><AdminSaleOff /></AdminRoute>} />
            </Route>
        </Route>
    );
}
