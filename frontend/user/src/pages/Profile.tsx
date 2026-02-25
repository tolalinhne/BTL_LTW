import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Save, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert('Ảnh không được vượt quá 5MB');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise((r) => setTimeout(r, 800));
        if (user) {
            updateUser({ ...user, ...form, avatar: avatarPreview || undefined });
        }
        setIsSaving(false);
        setIsEditing(false);
    };

    const fields = [
        { name: 'name', label: 'Họ tên', icon: User, type: 'text' },
        { name: 'email', label: 'Email', icon: Mail, type: 'email' },
        { name: 'phone', label: 'Số điện thoại', icon: Phone, type: 'tel' },
        { name: 'address', label: 'Địa chỉ', icon: MapPin, type: 'text' },
    ];

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Tài khoản</h1>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 text-sm font-medium text-brand-accent border border-brand-accent rounded-full hover:bg-brand-accent/5 transition-colors"
                    >
                        Chỉnh sửa
                    </button>
                ) : (
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-brand-primary rounded-full hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                    >
                        <Save size={14} /> {isSaving ? 'Đang lưu...' : 'Lưu'}
                    </button>
                )}
            </div>

            {/* Avatar with upload */}
            <div className="flex items-center gap-4 mb-8">
                <div className="relative group">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                    />
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-2 border-brand-accent/20"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent text-2xl font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    )}
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                            <Camera size={20} className="text-white" />
                        </button>
                    )}
                </div>
                <div>
                    <p className="font-medium text-brand-primary">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs text-brand-accent hover:underline mt-1"
                        >
                            Đổi ảnh đại diện
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
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
                                    disabled={!isEditing}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:outline-none ${isEditing
                                        ? 'border-gray-200 focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent'
                                        : 'border-transparent bg-gray-50 cursor-default'
                                        }`}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
