import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getActiveSales } from '@/services/admin/sale.service';
import type { SaleItem } from '@/services/admin/sale.service';
import type { Product } from '@/types/user.types';

interface SaleContextType {
    activeSales: SaleItem[];
    enrichWithSale: (product: Product) => Product;
    enrichManyWithSale: (products: Product[]) => Product[];
    getSalePrice: (product: Product) => number | null;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

function buildSaleMap(sales: SaleItem[]): Map<number, number> {
    const map = new Map<number, number>();
    for (const sale of sales) {
        if (!sale.productIds) continue;
        for (const pid of sale.productIds) {
            const existing = map.get(pid) || 0;
            if (sale.discountPercent > existing) map.set(pid, sale.discountPercent);
        }
    }
    return map;
}

export const SaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeSales, setActiveSales] = useState<SaleItem[]>([]);
    const [saleMap, setSaleMap] = useState<Map<number, number>>(new Map());
    const hasFetched = useRef(false);

    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        getActiveSales()
            .then((sales) => {
                setActiveSales(sales);
                setSaleMap(buildSaleMap(sales));
            })
            .catch(() => {
                // Silent fail
            });
    }, []);

    const getSalePrice = useCallback((product: Product): number | null => {
        const discountPct = saleMap.get(Number(product.id));
        if (!discountPct || discountPct <= 0) return null;
        return Math.round(product.price * (1 - discountPct / 100));
    }, [saleMap]);

    const enrichWithSale = useCallback((product: Product): Product => {
        // Đã enrich thì bỏ qua
        if (product.salePrice) return product;

        const discountPct = saleMap.get(Number(product.id));
        if (!discountPct || discountPct <= 0) return product;

        const salePrice = Math.round(product.price * (1 - discountPct / 100));
        return {
            ...product,
            isSale: true,
            discount: discountPct,
            discountPercent: discountPct,
            salePrice,
        };
    }, [saleMap]);

    const enrichManyWithSale = useCallback((products: Product[]): Product[] => {
        return products.map(enrichWithSale);
    }, [enrichWithSale]);

    return (
        <SaleContext.Provider value={{ activeSales, enrichWithSale, enrichManyWithSale, getSalePrice }}>
            {children}
        </SaleContext.Provider>
    );
};

export const useSale = () => {
    const ctx = useContext(SaleContext);
    if (!ctx) throw new Error('useSale must be used within SaleProvider');
    return ctx;
};
