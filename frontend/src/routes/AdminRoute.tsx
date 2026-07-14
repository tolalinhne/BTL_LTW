import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types/shared.types';

interface AdminRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
    requiredPermissions?: string[];
}

export default function AdminRoute({ children, allowedRoles, requiredPermissions }: AdminRouteProps) {
    const { isLoading, adminUser } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-10 h-10 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
            </div>
        );
    }

    if (!adminUser) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    const adminRole = adminUser.role?.toLowerCase();

    // Check if user has admin/staff role
    if (adminRole !== 'admin' && adminRole !== 'staff') {
        return <Navigate to="/" replace />;
    }

    if (allowedRoles && adminRole && !allowedRoles.includes(adminRole as Role)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                    <p className="text-gray-500">Bạn không có quyền truy cập trang này (Yêu cầu quyền: {allowedRoles.join(', ')}).</p>
                </div>
            </div>
        );
    }
    
    // Check specific permissions if required
    if (requiredPermissions && requiredPermissions.length > 0) {
        const userPermissions = adminUser?.permissions || [];
        const hasAllPermissions = requiredPermissions.every(p => userPermissions.includes(p));
        
        if (!hasAllPermissions) {
             return (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không đủ quyền truy cập tính năng</h2>
                        <p className="text-gray-500">Bạn cần thêm quyền hạn để xem chức năng này.</p>
                    </div>
                </div>
            );
        }
    }

    return <>{children}</>;
}
