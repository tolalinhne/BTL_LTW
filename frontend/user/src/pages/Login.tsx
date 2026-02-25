import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // Mock login (replace with authService.login)
            await new Promise((r) => setTimeout(r, 1000));
            const mockUser = {
                id: '1',
                email,
                name: 'Khách hàng',
                role: 'customer' as const,
            };
            login('mock-jwt-token', mockUser);
            navigate(from, { replace: true });
        } catch {
            setError('Email hoặc mật khẩu không đúng');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block font-serif text-3xl font-bold text-brand-primary mb-2">
                        Li<span className="text-brand-accent">Li</span>
                    </Link>
                    <p className="text-gray-500">Đăng nhập vào tài khoản</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
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
                                    placeholder="email@example.com"
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
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
                                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
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

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="accent-brand-accent rounded" />
                                <span className="text-gray-600">Ghi nhớ</span>
                            </label>
                            <a href="#" className="text-brand-accent hover:underline">Quên mật khẩu?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-brand-accent font-medium hover:underline">
                            Đăng ký ngay
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
