import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Role } from '@/types';
import { tokenStorage } from '@/utils/token';

interface AuthContextType {
    user: User | null;
    role: Role | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = tokenStorage.getUser();
        const token = tokenStorage.getToken();
        if (stored && token) {
            try { setUser(JSON.parse(stored)); } catch { tokenStorage.clear(); }
        }
        setIsLoading(false);
    }, []);

    const login = useCallback((token: string, userData: User) => {
        tokenStorage.setToken(token);
        tokenStorage.setUser(JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        tokenStorage.clear();
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            role: user?.role || null,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be within AuthProvider');
    return ctx;
};
