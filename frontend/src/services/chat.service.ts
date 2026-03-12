import api from './api';
import type { ChatApiResponse } from '@/types/user.types';

const MOCK_PRODUCTS = [
    {
        id: 'mock-1',
        name: 'Áo Blazer Oversized Thanh Lịch',
        price: 890000,
        originalPrice: 1290000,
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=400&fit=crop',
        category: 'Áo khoác',
    },
    {
        id: 'mock-2',
        name: 'Váy Midi Hoa Nhí Vintage',
        price: 650000,
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=300&h=400&fit=crop',
        category: 'Váy',
    },
    {
        id: 'mock-3',
        name: 'Quần Jeans Ống Rộng Y2K',
        price: 520000,
        originalPrice: 750000,
        image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&h=400&fit=crop',
        category: 'Quần',
    },
];

const MOCK_REPLIES: Record<string, string> = {
    default: 'Cảm ơn bạn đã liên hệ! Mình là **AI Fashion Assistant** của LiLi Fashion 🛍️\n\nMình có thể giúp bạn:\n- 👗 Gợi ý sản phẩm phù hợp\n- 📏 Tư vấn size\n- 👔 Phối đồ\n- 📦 Tra cứu đơn hàng\n\nBạn cần hỗ trợ gì nào?',
    size: 'Với chiều cao **1m65** và cân nặng **55kg**, mình gợi ý bạn:\n\n- **Áo**: Size **M** (form regular) hoặc **L** (form oversized)\n- **Quần**: Size **28-29**\n- **Váy**: Size **M**\n\n💡 *Tip*: Nếu bạn thích mặc rộng thoải mái, hãy lên 1 size nhé!',
    outfit: 'Đây là gợi ý phối đồ cho bạn! 🎨\n\n**Outfit đi chơi cuối tuần:**\n1. Áo blazer oversized + quần jeans ống rộng\n2. Giày sneaker trắng\n3. Túi tote canvas\n\nMình tìm được vài sản phẩm phù hợp cho bạn:',
    winter: 'Mùa đông năm nay, những item **must-have** bao gồm:\n\n- 🧥 Áo khoác dạ dáng dài\n- 🧤 Áo len cổ lọ\n- 👖 Quần corduroy\n- 🧣 Khăn len cashmere\n\nĐây là một số sản phẩm đang hot:',
};

function getMockReply(message: string): ChatApiResponse {
    const lower = message.toLowerCase();
    let reply = MOCK_REPLIES.default;
    let products: typeof MOCK_PRODUCTS = [];

    if (lower.includes('size') || lower.includes('1m6') || lower.includes('kg')) {
        reply = MOCK_REPLIES.size;
    } else if (lower.includes('outfit') || lower.includes('phối') || lower.includes('đi chơi')) {
        reply = MOCK_REPLIES.outfit;
        products = MOCK_PRODUCTS.slice(0, 2);
    } else if (lower.includes('đông') || lower.includes('khoác') || lower.includes('winter')) {
        reply = MOCK_REPLIES.winter;
        products = MOCK_PRODUCTS;
    } else if (lower.includes('gợi ý') || lower.includes('sản phẩm') || lower.includes('mua')) {
        reply = 'Dựa trên yêu cầu của bạn, mình gợi ý những sản phẩm sau đây:';
        products = MOCK_PRODUCTS.slice(0, 2);
    }

    return { reply, recommendedProducts: products };
}

export async function sendChatMessage(
    message: string,
    sessionId: string,
    userId?: string
): Promise<ChatApiResponse> {
    try {
        const res = await api.post<ChatApiResponse>('/ai/chat', {
            message,
            sessionId,
            userId,
        });
        return res.data;
    } catch {
        // Fallback to mock when API is unavailable
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
        return getMockReply(message);
    }
}
