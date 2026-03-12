import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { formatPrice } from '@/utils/formatPrice';
import type { ChatProduct } from '@/types/user.types';

interface ProductCardInChatProps {
    product: ChatProduct;
}

export default function ProductCardInChat({ product }: ProductCardInChatProps) {
    return (
        <Link
            to={`/product/${product.id}`}
            className="flex gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-brand-accent/30 hover:shadow-sm transition-all group"
        >
            <div className="w-16 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
            </div>
            <div className="flex flex-col justify-center min-w-0 flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">
                    {product.category}
                </p>
                <p className="text-sm font-medium text-brand-primary line-clamp-1 group-hover:text-brand-accent transition-colors">
                    {product.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-semibold text-brand-accent">
                        {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center flex-shrink-0">
                <ExternalLink size={14} className="text-gray-300 group-hover:text-brand-accent transition-colors" />
            </div>
        </Link>
    );
}
