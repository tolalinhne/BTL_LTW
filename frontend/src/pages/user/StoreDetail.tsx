import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Clock, Navigation, ChevronRight } from 'lucide-react';

const STORES_DATA: Record<string, { name: string; address: string; phone: string; hours: string }> = {
    '1': { name: 'LiLi VAN HANH MALL', address: 'Tầng 1, TTTM Vạn Hạnh Mall, 11 Sư Vạn Hạnh, P.12, Q.10, TP.HCM', phone: '028 1234 5678', hours: '09:30 - 22:00' },
    '2': { name: 'LiLi PARC MALL', address: 'Tầng 2, PARC Mall, 547 Tạ Quang Bửu, P.4, Q.8, TP.HCM', phone: '028 9876 5432', hours: '09:00 - 22:00' },
    '3': { name: 'LiLi LOTTE MART', address: 'Tầng 2, LOTTE Mart, Đ. Nguyễn Hữu Thọ, Q.7, TP.HCM', phone: '028 1111 2222', hours: '09:00 - 21:30' },
    '4': { name: 'LiLi GIGA MALL', address: 'Tầng 2, GIGA Mall, 242 Phạm Văn Đồng, TP. Thủ Đức', phone: '028 3333 4444', hours: '09:30 - 22:00' },
};

const NEARBY_STORES = [
    { name: 'LiLi Nguyễn Trãi', address: 'Tầng 1, TTTM Vạn Hạnh Mall, 11 Sư Vạn Hạnh, P.12, Q.10, TP.HCM' },
    { name: 'LiLi Vincom Center', address: 'Tầng 1, Vincom Center, Đồng Khởi, Q.1, TP.HCM' },
    { name: 'LiLi Saigon Centre', address: 'Tầng 2, Saigon Centre, Lê Lợi, Q.1, TP.HCM' },
];

export default function StoreDetail() {
    const { id } = useParams<{ id: string }>();
    const store = id ? STORES_DATA[id] : null;
    const storeInfo = store || { name: 'LiLi Store', address: 'Đang cập nhật', phone: '028 0000 0000', hours: '09:00 - 22:00' };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8">
                <Link to="/" className="hover:text-brand-primary">Trang chủ</Link>
                <ChevronRight size={12} />
                <Link to="/store" className="hover:text-brand-primary">Hệ thống cửa hàng</Link>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium">{storeInfo.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                <div className="lg:col-span-2 space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden">
                        <img
                            src={`https://picsum.photos/seed/storedetail${id}/1200/600`}
                            alt="Store Detail"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                            <img src={`https://picsum.photos/seed/storeint1${id}/600/400`} alt="Interior 1" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <div className="aspect-video bg-gray-100 rounded-xl overflow-hidden">
                            <img src={`https://picsum.photos/seed/storeint2${id}/600/400`} alt="Interior 2" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="space-y-6">
                        <h1 className="text-3xl font-serif font-bold">{storeInfo.name}</h1>
                        <div className="space-y-4 text-sm">
                            <div className="flex gap-3">
                                <MapPin size={20} className="shrink-0 text-brand-accent" />
                                <p className="font-medium text-gray-600">Địa chỉ: {storeInfo.address}</p>
                            </div>
                            <div className="flex gap-3">
                                <Phone size={20} className="shrink-0 text-brand-accent" />
                                <p className="font-medium text-gray-600">Điện thoại: {storeInfo.phone}</p>
                            </div>
                            <div className="flex gap-3">
                                <Clock size={20} className="shrink-0 text-brand-accent" />
                                <p className="font-medium text-gray-600">Giờ mở cửa: {storeInfo.hours}</p>
                            </div>
                        </div>
                        <button className="w-full bg-brand-accent text-white py-4 font-bold uppercase tracking-widest rounded-full hover:bg-brand-primary transition-all flex items-center justify-center gap-2">
                            <Navigation size={18} /> Chỉ đường
                        </button>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-2xl">
                        <h3 className="font-bold text-sm uppercase tracking-widest mb-4">Bản đồ</h3>
                        <div className="aspect-square bg-gray-200 rounded-xl overflow-hidden">
                            <img
                                src={`https://picsum.photos/seed/map${id}/400/400`}
                                alt="Map"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nearby Stores */}
            <section>
                <h2 className="text-2xl font-serif font-bold mb-8">Các cửa hàng lân cận</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {NEARBY_STORES.map((s, idx) => (
                        <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-brand-accent transition-all cursor-pointer hover:shadow-sm">
                            <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0 overflow-hidden">
                                <img src={`https://picsum.photos/seed/near${idx}/200/200`} alt={s.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-bold text-sm">{s.name}</h4>
                                <p className="text-[10px] text-gray-400 leading-relaxed">{s.address}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
