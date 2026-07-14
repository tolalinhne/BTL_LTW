import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/utils/formatPrice';

export default function Wishlist() {
    const { wishlist, removeFromWishlist, isLoading } = useWishlist();
    const { addToCart } = useCart();

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
                    <div className="w-64 h-8 bg-gray-200 rounded-lg mb-2"></div>
                    <div className="w-48 h-4 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        );
    }

    if (wishlist.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Chưa có sản phẩm yêu thích</h2>
                <p className="text-gray-500 mb-6">Hãy thêm sản phẩm yêu thích để theo dõi</p>
                <Link
                    to="/products"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                >
                    Khám phá sản phẩm <ArrowRight size={16} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-8">
                Sản phẩm yêu thích ({wishlist.length})
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlist.map((product, index) => (
                    <div key={`${product.id}-${index}`} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden bg-gray-100">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </Link>
                        <div className="p-4">
                            <Link to={`/product/${product.id}`}>
                                <h3 className="text-sm font-medium text-brand-primary truncate hover:text-brand-accent transition-colors">
                                    {product.name}
                                </h3>
                            </Link>
                            <p className="text-sm font-bold mt-1">{formatPrice(product.price)}</p>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => {
                                        addToCart(product, 1, product.sizes?.[0] || 'M', product.colors?.[0] || 'Black');
                                        removeFromWishlist(product.id);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-brand-primary text-white text-xs font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                                >
                                    <ShoppingBag size={14} /> Thêm vào giỏ
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(product.id)}
                                    className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-full text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
