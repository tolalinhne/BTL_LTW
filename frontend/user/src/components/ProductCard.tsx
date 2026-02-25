import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Check } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import type { Product } from '@/types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const [selectedColor, setSelectedColor] = useState(product.colors[0]);
    const [addedToCart, setAddedToCart] = useState(false);

    const inWishlist = isInWishlist(product.id);

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } });
            return;
        }
        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const defaultSize = product.sizes?.[0] || 'M';
        addToCart(product, 1, defaultSize, selectedColor);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 1500);
    };

    const handleColorClick = (e: React.MouseEvent, color: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedColor(color);
    };

    return (
        <Link to={`/product/${product.id}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] mb-3">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isNew && (
                        <span className="px-2.5 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            Mới
                        </span>
                    )}
                    {product.isSale && product.discount && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            -{product.discount}%
                        </span>
                    )}
                    {product.isBestSeller && (
                        <span className="px-2.5 py-1 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            Bán chạy
                        </span>
                    )}
                </div>

                {/* Quick actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <button
                        onClick={handleWishlist}
                        className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${inWishlist
                                ? 'bg-red-50 text-red-500'
                                : 'bg-white text-gray-600 hover:text-red-500'
                            }`}
                    >
                        <Heart size={16} className={inWishlist ? 'fill-red-500' : ''} />
                    </button>
                    <button
                        onClick={handleAddToCart}
                        className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${addedToCart
                                ? 'bg-green-500 text-white'
                                : 'bg-white text-gray-600 hover:text-brand-accent'
                            }`}
                    >
                        {addedToCart ? <Check size={16} /> : <ShoppingBag size={16} />}
                    </button>
                </div>

                {/* Color options — now clickable */}
                {product.colors.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                        {product.colors.map((color) => (
                            <button
                                key={color}
                                onClick={(e) => handleColorClick(e, color)}
                                className={`w-5 h-5 rounded-full border-2 shadow-sm transition-transform ${selectedColor === color
                                        ? 'border-white scale-125 ring-2 ring-brand-accent'
                                        : 'border-white'
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="px-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
                <h3 className="text-sm font-medium text-brand-primary group-hover:text-brand-accent transition-colors line-clamp-1">
                    {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm font-semibold text-brand-primary">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
