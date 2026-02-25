import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { tokenStorage } from '@/utils/token';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Restore auth state from localStorage
        const storedUser = tokenStorage.getUser();
        const token = tokenStorage.getToken();
        if (storedUser && token) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                tokenStorage.clear();
            }
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

    const updateUser = useCallback((userData: User) => {
        tokenStorage.setUser(JSON.stringify(userData));
        setUser(userData);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateUser,
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
