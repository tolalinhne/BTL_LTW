import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { authService } from '@/services/auth.service';

export default function Register() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { syncCart } = useCart();
    const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (form.password.length < 6) {
            setError('Mật khẩu phải ít nhất 6 ký tự');
            return;
        }

        setIsLoading(true);
        try {
            const data = await authService.register({
                name: form.name,
                email: form.email,
                password: form.password,
                phone: form.phone,
            });

            if (data?.accessToken && data?.user) {
                login(data.accessToken, data.user, data.refreshToken);
                await syncCart();
                navigate('/');
            } else {
                 setError('Đăng ký thất bại');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setIsLoading(false);
        }
    };

    const fields = [
        { name: 'name', label: 'Họ tên', icon: User, type: 'text', placeholder: 'Nguyễn Văn A' },
        { name: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: 'email@example.com' },
        { name: 'phone', label: 'Số điện thoại', icon: Phone, type: 'tel', placeholder: '0912 345 678' },
        { name: 'password', label: 'Mật khẩu', icon: Lock, type: 'password', placeholder: '••••••••' },
        { name: 'confirmPassword', label: 'Xác nhận mật khẩu', icon: Lock, type: 'password', placeholder: '••••••••' },
    ];

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block font-serif text-3xl font-bold text-brand-primary mb-2">
                        Li<span className="text-brand-accent">Li</span>
                    </Link>
                    <p className="text-gray-500">Tạo tài khoản mới</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">{error}</div>
                        )}

                        {fields.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.name}>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                                    <div className="relative">
                                        <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type={f.type}
                                            name={f.name}
                                            value={(form as Record<string, string>)[f.name]}
                                            onChange={handleChange}
                                            required
                                            placeholder={f.placeholder}
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent"
                                        />
                                    </div>
                                </div>
                            );
                        })}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors disabled:opacity-50 mt-2"
                        >
                            {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-brand-accent font-medium hover:underline">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
