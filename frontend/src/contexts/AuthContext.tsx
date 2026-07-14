import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Role } from '@/types/shared.types';
import { adminTokenStorage, userTokenStorage } from '@/utils/token';
import { useLocation } from 'react-router-dom';

interface AuthContextType {
    user: User | null;
    role: Role | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User, refreshToken?: string) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    // Explicit admin/user access
    adminUser: User | null;
    regularUser: User | null;
    loginAdmin: (token: string, user: User, refreshToken?: string) => void;
    loginUser: (token: string, user: User, refreshToken?: string) => void;
    logoutAdmin: () => void;
    logoutUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [adminUser, setAdminUser] = useState<User | null>(null);
    const [regularUser, setRegularUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore both auth states from storage on mount
    useEffect(() => {
        const storedAdmin = adminTokenStorage.getUser();
        const adminToken = adminTokenStorage.getToken();
        if (storedAdmin && adminToken) {
            try { setAdminUser(JSON.parse(storedAdmin)); } catch { adminTokenStorage.clear(); }
        }

        const storedUser = userTokenStorage.getUser();
        const userToken = userTokenStorage.getToken();
        if (storedUser && userToken) {
            try { setRegularUser(JSON.parse(storedUser)); } catch { userTokenStorage.clear(); }
        }

        setIsLoading(false);

        // Listen for token expiration from interceptor
        const handleAuthExpired = () => {
            setAdminUser(null);
            setRegularUser(null);
        };
        window.addEventListener('auth-expired', handleAuthExpired);
        return () => window.removeEventListener('auth-expired', handleAuthExpired);
    }, []);

    // Admin auth methods
    const loginAdmin = useCallback((token: string, userData: User, refreshToken?: string) => {
        adminTokenStorage.setToken(token);
        if (refreshToken) adminTokenStorage.setRefreshToken(refreshToken);
        adminTokenStorage.setUser(JSON.stringify(userData));
        setAdminUser(userData);
    }, []);

    const logoutAdmin = useCallback(() => {
        adminTokenStorage.clear();
        setAdminUser(null);
    }, []);

    // User auth methods
    const loginUser = useCallback((token: string, userData: User, refreshToken?: string) => {
        userTokenStorage.setToken(token);
        if (refreshToken) userTokenStorage.setRefreshToken(refreshToken);
        userTokenStorage.setUser(JSON.stringify(userData));
        setRegularUser(userData);
    }, []);

    const logoutUser = useCallback(() => {
        userTokenStorage.clear();
        setRegularUser(null);
    }, []);

    // Context-aware: determine which user to expose based on current path
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
    const isAdminContext = pathname.startsWith('/admin');
    const currentUser = isAdminContext ? adminUser : regularUser;

    // Legacy-compatible methods (auto-detect context)
    const login = useCallback((token: string, userData: User, refreshToken?: string) => {
        if (window.location.pathname.startsWith('/admin')) {
            loginAdmin(token, userData, refreshToken);
        } else {
            loginUser(token, userData, refreshToken);
        }
    }, [loginAdmin, loginUser]);

    const logout = useCallback(() => {
        if (window.location.pathname.startsWith('/admin')) {
            logoutAdmin();
        } else {
            logoutUser();
        }
    }, [logoutAdmin, logoutUser]);

    const updateUser = useCallback((userData: User) => {
        if (window.location.pathname.startsWith('/admin')) {
            adminTokenStorage.setUser(JSON.stringify(userData));
            setAdminUser(userData);
        } else {
            userTokenStorage.setUser(JSON.stringify(userData));
            setRegularUser(userData);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user: currentUser,
                role: currentUser?.role || null,
                isAuthenticated: !!currentUser,
                isLoading,
                login,
                logout,
                updateUser,
                adminUser,
                regularUser,
                loginAdmin,
                loginUser,
                logoutAdmin,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
