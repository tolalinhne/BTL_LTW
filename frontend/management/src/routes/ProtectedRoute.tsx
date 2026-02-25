import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: Role[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, role } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="w-10 h-10 border-4 border-primary/20 rounded-full animate-spin border-t-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
                    <p className="text-gray-500">Bạn không có quyền truy cập trang này.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
