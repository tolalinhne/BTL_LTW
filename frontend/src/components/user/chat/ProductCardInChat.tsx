import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import type { ChatProduct } from '@/types/user.types';

interface ProductCardInChatProps {
    product: ChatProduct;
}

export default function ProductCardInChat({ product }: ProductCardInChatProps) {
    return (
        <Link
            to={`/product/${product.slug}`}
            className="chat-product-card group"
        >
            {/* Product Image */}
            <div className="chat-product-card__image">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm text-brand-primary text-[10px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ShoppingBag size={10} />
                        Xem chi tiết
                    </span>
                </div>
                {/* Sale badge */}
                {product.originalPrice && product.originalPrice > product.price && (
                    <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm">
                        -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                )}
            </div>

            {/* Product Info */}
            <div className="chat-product-card__info">
                {product.categoryName && (
                    <p className="text-[9px] uppercase tracking-wider text-gray-400 mb-0.5 truncate">
                        {product.categoryName}
                    </p>
                )}
                <p className="text-[11px] font-medium text-brand-primary line-clamp-2 leading-tight group-hover:text-brand-accent transition-colors min-h-[28px]">
                    {product.name}
                </p>
                <div className="flex items-center gap-1.5 mt-auto pt-1">
                    <span className="text-[12px] font-bold text-brand-accent">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[9px] text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}
