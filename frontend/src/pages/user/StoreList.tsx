import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

const STORES = [
    { id: '1', name: 'LiLi VAN HANH MALL', address: 'Tầng 2 - Vạn Hạnh Mall, 11 Sư Vạn Hạnh, P. 12, Q. 10, TP. Hồ Chí Minh', image: 'https://picsum.photos/seed/store1/800/400' },
    { id: '2', name: 'LiLi PARC MALL', address: 'Tầng 2 - PARC Mall, 547 - 549 Tạ Quang Bửu, P. 4, Q. 8, TP. Hồ Chí Minh', image: 'https://picsum.photos/seed/store2/800/400' },
    { id: '3', name: 'LiLi LOTTE MART', address: 'Tầng 2 - LOTTE Mart, Đ. Nguyễn Hữu Thọ, Q. 7, TP. Hồ Chí Minh', image: 'https://picsum.photos/seed/store3/800/400' },
    { id: '4', name: 'LiLi GIGA MALL', address: 'Tầng 2 - GIGA Mall, 242 Phạm Văn Đồng, P. Hiệp Bình Chánh, TP. Thủ Đức', image: 'https://picsum.photos/seed/store4/800/400' },
];

export default function StoreList() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-serif font-bold text-center mb-12">Danh sách cửa hàng</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {STORES.map((store) => (
                    <div key={store.id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-shadow">
                        <div className="md:w-1/2 aspect-video md:aspect-auto relative overflow-hidden">
                            <img
                                src={store.image}
                                alt={store.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-widest uppercase rounded-md">
                                LiLi
                            </div>
                        </div>
                        <div className="md:w-1/2 p-8 flex flex-col justify-between bg-gray-50">
                            <div className="space-y-4">
                                <h3 className="text-xl font-serif font-bold">{store.name}</h3>
                                <div className="flex gap-2 text-sm text-gray-500">
                                    <MapPin size={18} className="shrink-0 text-brand-accent" />
                                    <p>{store.address}</p>
                                </div>
                            </div>
                            <Link
                                to={`/store/${store.id}`}
                                className="mt-8 inline-block bg-brand-accent text-white text-center py-2.5 px-6 text-xs font-bold uppercase tracking-widest rounded-full hover:bg-brand-primary transition-all"
                            >
                                Xem chi tiết
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
