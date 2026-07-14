import React, { useState, useRef } from 'react';
import { User, Mail, Phone, MapPin, Save, Camera, Plus, Edit, Trash2, Navigation, X, Check, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { uploadService } from '@/services/admin/upload.service';
import api from '@/services/api';
import type { Address } from '@/types/user.types';

const ADDRESSES_KEY = 'lili_user_addresses';

function loadAddresses(): Address[] {
    try {
        const stored = localStorage.getItem(ADDRESSES_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return [
        { id: '1', name: 'Nguyễn Văn A', phone: '0901234567', address: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', isDefault: true },
    ];
}

function saveAddresses(addresses: Address[]) {
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
}

export default function Profile() {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
    });
    const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar || null);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Address management
    const [addresses, setAddresses] = useState<Address[]>(loadAddresses);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [addressForm, setAddressForm] = useState({ name: '', phone: '', address: '', isDefault: false });
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) {
            alert('Ảnh không được vượt quá 10MB');
            return;
        }
        setIsUploadingAvatar(true);
        try {
            const result = await uploadService.uploadImage(file, 'avatars');
            setAvatarPreview(result.url);
        } catch (err) {
            console.error('Lỗi upload avatar:', err);
            alert('Lỗi khi tải ảnh lên. Vui lòng thử lại.');
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                name: form.name,
                phone: form.phone,
                avatar: avatarPreview || undefined,
            };
            const res = await api.put('/auth/profile', payload);
            const updated = res.data?.data;
            if (user && updated) {
                updateUser({ ...user, ...updated });
            } else if (user) {
                updateUser({ ...user, ...form, avatar: avatarPreview || undefined });
            }
        } catch (err) {
            console.error('Lỗi cập nhật profile:', err);
            alert('Lỗi khi lưu thông tin. Vui lòng thử lại.');
        } finally {
            setIsSaving(false);
            setIsEditing(false);
        }
    };

    // Address handlers
    const openAddAddress = () => {
        setEditingAddress(null);
        setAddressForm({ name: user?.name || '', phone: user?.phone || '', address: '', isDefault: addresses.length === 0 });
        setShowAddressModal(true);
    };

    const openEditAddress = (addr: Address) => {
        setEditingAddress(addr);
        setAddressForm({ name: addr.name, phone: addr.phone, address: addr.address, isDefault: addr.isDefault });
        setShowAddressModal(true);
    };

    const handleAddressSubmit = () => {
        if (!addressForm.name.trim() || !addressForm.phone.trim() || !addressForm.address.trim()) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        let updated: Address[];
        if (editingAddress) {
            updated = addresses.map((a) => {
                if (a.id === editingAddress.id) {
                    return { ...a, ...addressForm };
                }
                // If new default, unset others
                if (addressForm.isDefault) {
                    return { ...a, isDefault: false };
                }
                return a;
            });
        } else {
            const newAddr: Address = {
                id: String(Date.now()),
                ...addressForm,
            };
            updated = addressForm.isDefault
                ? [...addresses.map((a) => ({ ...a, isDefault: false })), newAddr]
                : [...addresses, newAddr];
        }

        setAddresses(updated);
        saveAddresses(updated);
        setShowAddressModal(false);
    };

    const handleDeleteAddress = (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
        const updated = addresses.filter((a) => a.id !== id);
        // If deleted default, set first as default
        if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
            updated[0].isDefault = true;
        }
        setAddresses(updated);
        saveAddresses(updated);
    };

    const handleSetDefault = (id: string) => {
        const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
        setAddresses(updated);
        saveAddresses(updated);
    };

    const handleUseCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Trình duyệt không hỗ trợ định vị');
            return;
        }
        setIsGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Use reverse geocoding (free API)
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=vi`
                    );
                    const data = await res.json();
                    if (data.display_name) {
                        setAddressForm((prev) => ({ ...prev, address: data.display_name }));
                    }
                } catch {
                    alert('Không thể lấy địa chỉ từ vị trí');
                } finally {
                    setIsGettingLocation(false);
                }
            },
            () => {
                alert('Không thể truy cập vị trí. Vui lòng cho phép quyền truy cập vị trí.');
                setIsGettingLocation(false);
            }
        );
    };

    const profileFields = [
        { name: 'name', label: 'Họ tên', icon: User, type: 'text' },
        { name: 'email', label: 'Email', icon: Mail, type: 'email' },
        { name: 'phone', label: 'Số điện thoại', icon: Phone, type: 'tel' },
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
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    {isUploadingAvatar ? (
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                            <Loader2 size={24} className="text-brand-accent animate-spin" />
                        </div>
                    ) : avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-2 border-brand-accent/20" />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-brand-accent/10 flex items-center justify-center text-brand-accent text-2xl font-bold">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                    )}
                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Camera size={20} className="text-white" />
                        </button>
                    )}
                </div>
                <div>
                    <p className="font-medium text-brand-primary">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    {isEditing && (
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs text-brand-accent hover:underline mt-1">
                            Đổi ảnh đại diện
                        </button>
                    )}
                </div>
            </div>

            {/* Profile fields */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5 mb-8">
                <h3 className="text-sm font-semibold text-gray-900">Thông tin cá nhân</h3>
                {profileFields.map((f) => {
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

            {/* Addresses section — Shopee style */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <MapPin size={16} className="text-brand-accent" /> Địa chỉ nhận hàng
                    </h3>
                    <button
                        onClick={openAddAddress}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-accent border border-brand-accent rounded-full hover:bg-brand-accent/5 transition-colors"
                    >
                        <Plus size={12} /> Thêm địa chỉ
                    </button>
                </div>

                {addresses.length === 0 ? (
                    <div className="text-center py-8">
                        <MapPin size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-sm text-gray-400">Chưa có địa chỉ nào</p>
                        <button onClick={openAddAddress} className="mt-3 text-sm text-brand-accent hover:underline">
                            Thêm địa chỉ đầu tiên
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {addresses.map((addr) => (
                            <div
                                key={addr.id}
                                className={`relative p-4 rounded-xl border transition-colors ${addr.isDefault
                                    ? 'border-brand-accent/30 bg-brand-accent/5'
                                    : 'border-gray-100 hover:border-gray-200'
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-medium text-gray-900">{addr.name}</span>
                                            <span className="text-gray-300">|</span>
                                            <span className="text-sm text-gray-500">{addr.phone}</span>
                                            {addr.isDefault && (
                                                <span className="px-2 py-0.5 bg-brand-accent text-white text-[10px] font-bold rounded-full">
                                                    Mặc định
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{addr.address}</p>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button onClick={() => openEditAddress(addr)} className="p-1.5 text-gray-400 hover:text-brand-accent rounded-lg hover:bg-gray-100">
                                            <Edit size={14} />
                                        </button>
                                        {!addr.isDefault && (
                                            <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {!addr.isDefault && (
                                    <button
                                        onClick={() => handleSetDefault(addr.id)}
                                        className="mt-2 text-xs text-brand-accent hover:underline"
                                    >
                                        Đặt làm mặc định
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddressModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}
                            </h3>
                            <button onClick={() => setShowAddressModal(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="px-6 py-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên *</label>
                                    <input
                                        value={addressForm.name}
                                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                                        placeholder="Nguyễn Văn A"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                                    <input
                                        value={addressForm.phone}
                                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30"
                                        placeholder="0901234567"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-sm font-medium text-gray-700">Địa chỉ *</label>
                                    <button
                                        type="button"
                                        onClick={handleUseCurrentLocation}
                                        disabled={isGettingLocation}
                                        className="flex items-center gap-1 text-xs text-brand-accent hover:underline disabled:opacity-50"
                                    >
                                        <Navigation size={12} />
                                        {isGettingLocation ? 'Đang lấy vị trí...' : 'Dùng vị trí hiện tại'}
                                    </button>
                                </div>
                                <textarea
                                    value={addressForm.address}
                                    onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 resize-none"
                                    placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                <input
                                    type="checkbox"
                                    id="addrDefault"
                                    checked={addressForm.isDefault}
                                    onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                                    className="w-4 h-4 text-brand-accent border-gray-300 rounded focus:ring-brand-accent"
                                />
                                <label htmlFor="addrDefault" className="text-sm text-gray-700">
                                    Đặt làm địa chỉ mặc định
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowAddressModal(false)}
                                    className="flex-1 py-2.5 border border-gray-200 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleAddressSubmit}
                                    className="flex-1 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-brand-primary/90 flex items-center justify-center gap-1.5"
                                >
                                    <Check size={14} /> {editingAddress ? 'Cập nhật' : 'Thêm địa chỉ'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
