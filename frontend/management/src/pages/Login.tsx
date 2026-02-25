import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { Role } from '@/types';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Mock login — determine role from email
            await new Promise((r) => setTimeout(r, 800));
            const role: Role = email.includes('admin') ? 'admin' : 'staff';
            const mockUser = {
                id: '1',
                email,
                name: role === 'admin' ? 'Admin User' : 'Staff User',
                role,
            };
            login('mock-jwt-token', mockUser);
            navigate('/dashboard', { replace: true });
        } catch {
            setError('Email hoặc mật khẩu không đúng');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background-light to-primary/10 px-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary rounded-2xl text-white shadow-lg shadow-primary/30 mb-4">
                        <Sparkles size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">LiLi Fashion</h1>
                    <p className="text-gray-500 text-sm mt-1">Đăng nhập vào hệ thống quản lý</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="admin@lilifashion.vn"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 shadow-md shadow-primary/20"
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs text-gray-500">
                        <p className="font-medium text-gray-600 mb-1">Demo accounts:</p>
                        <p>Admin: <span className="text-primary">admin@lilifashion.vn</span></p>
                        <p>Staff: <span className="text-primary">staff@lilifashion.vn</span></p>
                        <p className="mt-1 text-gray-400">Mật khẩu: bất kỳ</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
