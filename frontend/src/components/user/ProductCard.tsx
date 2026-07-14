import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useSale } from '@/contexts/SaleContext';
import type { Product } from '@/types/user.types';

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product: rawProduct }: ProductCardProps) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { enrichWithSale } = useSale();

    // Enrich với thông tin sale (isSale, salePrice, discount)
    const product = enrichWithSale(rawProduct);

    const inWishlist = isInWishlist(product.id);

    // Local preview state — click màu chỉ đổi preview, không navigate
    const [activeColor, setActiveColor] = useState<string | null>(null);

    // Tìm ảnh của variant đang chọn (nếu variant có imageUrl riêng)
    const activeVariantImage = (() => {
        if (!activeColor || !product.variants) return null;
        const v = product.variants.find(v => v.color === activeColor && (v as any).imageUrl);
        return v ? (v as any).imageUrl as string : null;
    })();

    const displayImage = activeVariantImage || product.image;

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/product/${product.slug || product.id}` } } });
            return;
        }
        if (inWishlist) removeFromWishlist(product.id);
        else addToWishlist(product);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/product/${product.slug || product.id}`);
    };

    // Unique colors extracted from variants
    const colors = product.colors
        ?? product.variants?.map((v) => v.color).filter(Boolean).filter((c, i, a) => a.indexOf(c) === i)
        ?? [];

    const colorHexMap: Record<string, string> = {};
    product.variants?.forEach((v) => { if (v.color && v.colorHex) colorHexMap[v.color] = v.colorHex; });

    return (
        <Link to={`/product/${product.slug || product.id}`} className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[3/4] mb-3">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                    loading="lazy"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.isNew && (
                        <span className="px-2.5 py-1 bg-brand-primary text-white text-[10px] font-bold uppercase tracking-wider rounded-full">Mới</span>
                    )}
                    {product.isSale && product.discount && (
                        <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                            -{product.discount}%
                        </span>
                    )}
                    {product.isBestSeller && (
                        <span className="px-2.5 py-1 bg-brand-accent text-white text-[10px] font-bold uppercase tracking-wider rounded-full">Bán chạy</span>
                    )}
                </div>

                {/* Quick actions */}
                <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
                    <button
                        onClick={handleWishlist}
                        className={`w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors ${inWishlist ? 'bg-red-50 text-red-500' : 'bg-white text-gray-600 hover:text-red-500'}`}
                    >
                        <Heart size={16} className={inWishlist ? 'fill-red-500' : ''} />
                    </button>
                    <button
                        onClick={handleAddToCart}
                        className="w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-colors bg-white text-gray-600 hover:text-brand-accent"
                        title="Xem chi tiết & chọn thông số"
                    >
                        <ShoppingBag size={16} />
                    </button>
                </div>
            </div>

            <div className="px-1">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{product.category}</p>
                <h3 className="text-sm font-medium text-brand-primary group-hover:text-brand-accent transition-colors line-clamp-1">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 mt-1.5">
                    {product.isSale && product.salePrice ? (
                        <>
                            <span className="text-sm font-semibold text-red-500">{formatPrice(product.salePrice as number)}</span>
                            <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                        </>
                    ) : (
                        <span className="text-sm font-semibold text-brand-primary">{formatPrice(product.price)}</span>
                    )}
                </div>

                {/* Color swatches — click để preview ảnh, KHÔNG navigate */}
                {colors.length > 0 && (
                    <div className="flex gap-1.5 mt-2">
                        {colors.map((color: string) => (
                            <button
                                key={color}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    // Toggle: click lại màu đang chọn thì bỏ chọn
                                    setActiveColor(prev => prev === color ? null : color);
                                }}
                                className={`w-5 h-5 rounded-full border-2 transition-all shadow-sm cursor-pointer hover:scale-125 ${
                                    activeColor === color
                                        ? 'border-brand-primary scale-110 ring-1 ring-brand-primary ring-offset-1'
                                        : 'border-gray-200 hover:border-brand-primary'
                                }`}
                                style={{ backgroundColor: colorHexMap[color] || color }}
                                title={color}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Link>
    );
}
