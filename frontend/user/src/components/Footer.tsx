import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-brand-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand */}
                    <div>
                        <h3 className="font-serif text-2xl font-bold mb-4">
                            Li<span className="text-brand-accent">Li</span> Fashion
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed mb-4">
                            Thời trang nữ cao cấp — phong cách hiện đại, thanh lịch và tinh tế cho phái đẹp Việt Nam.
                        </p>
                        <div className="flex gap-3">
                            <a href="https://www.facebook.com/pham.linh.532178" className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-accent flex items-center justify-center transition-colors">
                                <Facebook size={16} />
                            </a>
                            <a href="https://www.instagram.com/plinh28419/" className="w-9 h-9 rounded-full bg-white/10 hover:bg-brand-accent flex items-center justify-center transition-colors">
                                <Instagram size={16} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-brand-accent">Danh mục</h4>
                        <ul className="space-y-2.5">
                            {[
                                { label: 'Đầm', to: '/products/dresses' },
                                { label: 'Áo', to: '/products/tops' },
                                { label: 'Quần', to: '/products/pants' },
                                { label: 'Phụ kiện', to: '/products/accessories' },
                                { label: 'Sale', to: '/products/sale' },
                            ].map((item) => (
                                <li key={item.to}>
                                    <Link to={item.to} className="text-sm text-gray-400 hover:text-white transition-colors">
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-brand-accent">Hỗ trợ</h4>
                        <ul className="space-y-2.5">
                            {['Hướng dẫn mua hàng', 'Chính sách đổi trả', 'Chính sách vận chuyển', 'Câu hỏi thường gặp'].map(
                                (item) => (
                                    <li key={item}>
                                        <a href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                                            {item}
                                        </a>
                                    </li>
                                )
                            )}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-brand-accent">Liên hệ</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2.5 text-sm text-gray-400">
                                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-brand-accent" />
                                <span>Km10 Đ. Nguyễn Trãi, P. Mộ Lao, Hà Đông, Hà Nội, Việt Nam</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-gray-400">
                                <Phone size={16} className="flex-shrink-0 text-brand-accent" />
                                <span>0385 276 198</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-sm text-gray-400">
                                <Mail size={16} className="flex-shrink-0 text-brand-accent" />
                                <span>plinh7009@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-10 pt-6 text-center">
                    <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} LiLi Fashion. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
