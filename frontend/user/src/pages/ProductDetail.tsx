import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Truck, RotateCcw, ChevronRight, Star } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { formatPrice } from '@/utils/formatPrice';
import type { Product, Review } from '@/types';

// Mock product (sẽ thay bằng API)
const MOCK_PRODUCT: Product = {
    id: '1',
    name: 'Lily Floral Dress',
    price: 785000,
    image: 'https://picsum.photos/seed/dress1/600/800',
    category: 'Dresses',
    colors: ['#f8d7da', '#d1ecf1', '#fff3cd'],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Đầm hoa thanh lịch, thiết kế xòe nhẹ nhàng phù hợp đi làm và dạo phố. Chất liệu vải lụa mềm mịn, thoáng mát.',
    isNew: true,
};

// Mock reviews
const MOCK_REVIEWS: Review[] = [
    { id: 'r1', userName: 'Nguyễn Thị Mai', rating: 5, comment: 'Đầm rất đẹp, chất liệu mềm mịn. Mặc rất thoải mái!', createdAt: '2025-01-15' },
    { id: 'r2', userName: 'Trần Hương Giang', rating: 4, comment: 'Màu sắc đúng như hình, giao hàng nhanh. Size hơi rộng một chút.', createdAt: '2025-01-10' },
    { id: 'r3', userName: 'Lê Phương Anh', rating: 5, comment: 'Chất lượng tuyệt vời, đường may tỉ mỉ. Sẽ mua thêm!', createdAt: '2024-12-28' },
    { id: 'r4', userName: 'Võ Minh Trang', rating: 3, comment: 'Sản phẩm tạm ổn, nhưng vải hơi mỏng so với giá tiền.', createdAt: '2024-12-20' },
    { id: 'r5', userName: 'Hoàng Thùy Linh', rating: 4, comment: 'Form đầm rất đẹp, mặc lên sang trọng lắm.', createdAt: '2024-12-15' },
    { id: 'r6', userName: 'Nguyễn Văn Hùng', rating: 5, comment: 'Mua tặng vợ, vợ rất thích. Sẽ quay lại!', createdAt: '2024-12-10' },
    { id: 'r7', userName: 'Phạm Thu Hà', rating: 2, comment: 'Giao hàng hơi lâu, màu hơi khác so với hình.', createdAt: '2024-12-05' },
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={size}
                    className={i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                />
            ))}
        </div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState(MOCK_PRODUCT.colors[0]);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'desc' | 'review'>('desc');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [filterStar, setFilterStar] = useState<number | null>(null);
    const [flyItems, setFlyItems] = useState<{ id: number; startX: number; startY: number; endX: number; endY: number; image: string }[]>([]);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    let flyId = useRef(0);

    const product = MOCK_PRODUCT; // In real app: fetch by id
    const inWishlist = isInWishlist(product.id);
    const avgRating = MOCK_REVIEWS.reduce((sum, r) => sum + r.rating, 0) / MOCK_REVIEWS.length;

    const handleAddToCart = useCallback(() => {
        if (!selectedSize) return alert('Vui lòng chọn size');
        addToCart(product, quantity, selectedSize, selectedColor);

        // Calculate fly animation positions
        const cartIcon = document.getElementById('header-cart-icon');
        const btnEl = addBtnRef.current;
        if (!cartIcon || !btnEl) return;

        const btnRect = btnEl.getBoundingClientRect();
        const cartRect = cartIcon.getBoundingClientRect();

        const newId = ++flyId.current;
        setFlyItems((prev) => [
            ...prev,
            {
                id: newId,
                startX: btnRect.left + btnRect.width / 2 - 25,
                startY: btnRect.top - 10,
                endX: cartRect.left + cartRect.width / 2 - 25,
                endY: cartRect.top + cartRect.height / 2 - 25,
                image: product.image,
            },
        ]);

        // Remove after animation completes
        setTimeout(() => {
            setFlyItems((prev) => prev.filter((item) => item.id !== newId));
        }, 800);
    }, [selectedSize, selectedColor, quantity, addToCart, product]);

    const handleToggleWishlist = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/product/${id}` } } });
            return;
        }
        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    };

    const handleSubmitReview = (e: React.FormEvent) => {
        e.preventDefault();
        // In real app: call API to submit review
        alert('Cảm ơn bạn đã đánh giá!');
        setReviewText('');
        setReviewRating(5);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
            {/* Fly-to-cart animation items */}
            {flyItems.map((item) => (
                <div
                    key={item.id}
                    className="fixed z-[9999] pointer-events-none"
                    style={{
                        left: item.startX,
                        top: item.startY,
                        animation: 'flyToCart 0.75s cubic-bezier(0.2, 0.6, 0.35, 1) forwards',
                        '--fly-end-x': `${item.endX - item.startX}px`,
                        '--fly-end-y': `${item.endY - item.startY}px`,
                    } as React.CSSProperties}
                >
                    <img
                        src={item.image}
                        alt=""
                        className="w-[50px] h-[50px] rounded-full object-cover shadow-lg border-2 border-brand-accent"
                    />
                </div>
            ))}
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-gray-500 mb-8">
                <Link to="/" className="hover:text-brand-primary">Trang chủ</Link>
                <ChevronRight size={14} className="mx-2" />
                <Link to="/products" className="hover:text-brand-primary">Sản phẩm</Link>
                <ChevronRight size={14} className="mx-2" />
                <span className="text-brand-primary font-medium truncate">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-10">
                {/* Image */}
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</span>
                        {product.isNew && (
                            <span className="px-2 py-0.5 bg-brand-primary text-white text-[10px] font-bold rounded-full">MỚI</span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold mb-3">{product.name}</h1>

                    <div className="flex items-center gap-3 mb-2">
                        <StarRating rating={Math.round(avgRating)} />
                        <span className="text-sm text-gray-400">({MOCK_REVIEWS.length} đánh giá)</span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-2xl font-bold text-brand-accent">{formatPrice(product.price)}</span>
                        {product.originalPrice && (
                            <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

                    {/* Color selector */}
                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Màu sắc</p>
                        <div className="flex gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? 'border-brand-primary scale-110 shadow-md' : 'border-gray-200'
                                        }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Size selector */}
                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Kích thước</p>
                        <div className="flex gap-2">
                            {(product.sizes || ['S', 'M', 'L', 'XL']).map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`min-w-[3rem] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                                        ? 'bg-brand-primary text-white border-brand-primary'
                                        : 'border-gray-200 text-gray-600 hover:border-brand-primary'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-8">
                        <p className="text-sm font-medium mb-3">Số lượng</p>
                        <div className="inline-flex items-center border border-gray-200 rounded-lg">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2.5 text-gray-500 hover:text-brand-primary">
                                <Minus size={16} />
                            </button>
                            <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="p-2.5 text-gray-500 hover:text-brand-primary">
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-8">
                        <button
                            ref={addBtnRef}
                            onClick={handleAddToCart}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                        >
                            <ShoppingBag size={18} /> Thêm vào giỏ
                        </button>
                        <button
                            onClick={handleToggleWishlist}
                            className={`w-14 h-14 border-2 rounded-full flex items-center justify-center transition-colors ${inWishlist
                                ? 'bg-red-50 border-red-200 text-red-500'
                                : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                                }`}
                        >
                            <Heart size={20} className={inWishlist ? 'fill-red-500' : ''} />
                        </button>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Truck size={16} className="text-brand-accent" /> Giao hàng miễn phí
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <RotateCcw size={16} className="text-brand-accent" /> Đổi trả 30 ngày
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs: Mô tả | Đánh giá */}
            <div className="mt-16 border-t border-gray-100 pt-10">
                <div className="flex gap-8 mb-8 border-b border-gray-100">
                    {(['desc', 'review'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-semibold uppercase tracking-wider border-b-2 transition-all ${activeTab === tab
                                ? 'text-brand-primary border-brand-primary'
                                : 'text-gray-400 border-transparent hover:text-gray-600'
                                }`}
                        >
                            {tab === 'desc' ? 'Mô tả' : `Đánh giá (${MOCK_REVIEWS.length})`}
                        </button>
                    ))}
                </div>

                {activeTab === 'desc' ? (
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                        <p>{product.description}</p>
                        <ul className="mt-4 space-y-2">
                            <li>Chất liệu: Vải lụa cao cấp</li>
                            <li>Kiểu dáng: Xòe nhẹ, thanh lịch</li>
                            <li>Phù hợp: Đi làm, dạo phố, dự tiệc nhẹ</li>
                            <li>Bảo quản: Giặt tay hoặc giặt máy ở chế độ nhẹ</li>
                        </ul>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Rating summary + filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-gray-50 rounded-xl">
                            <div className="text-center min-w-[80px]">
                                <p className="text-4xl font-bold text-brand-primary">{avgRating.toFixed(1)}</p>
                                <StarRating rating={Math.round(avgRating)} size={16} />
                                <p className="text-xs text-gray-400 mt-1">{MOCK_REVIEWS.length} đánh giá</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterStar(null)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filterStar === null
                                        ? 'bg-brand-primary text-white border-brand-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-accent'
                                        }`}
                                >
                                    Tất cả ({MOCK_REVIEWS.length})
                                </button>
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = MOCK_REVIEWS.filter((r) => r.rating === star).length;
                                    return (
                                        <button
                                            key={star}
                                            onClick={() => setFilterStar(star)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors flex items-center gap-1 ${filterStar === star
                                                ? 'bg-brand-primary text-white border-brand-primary'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-accent'
                                                }`}
                                        >
                                            {star} <Star size={10} className={filterStar === star ? 'fill-white' : 'fill-yellow-400 text-yellow-400'} /> ({count})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Filtered reviews list */}
                        <div className="space-y-6">
                            {MOCK_REVIEWS
                                .filter((r) => filterStar === null || r.rating === filterStar)
                                .map((review) => (
                                    <div key={review.id} className="border-b border-gray-50 pb-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center text-sm font-bold text-brand-primary">
                                                    {review.userName.charAt(0)}
                                                </div>
                                                <span className="text-sm font-medium">{review.userName}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">{review.createdAt}</span>
                                        </div>
                                        <StarRating rating={review.rating} />
                                        <p className="text-sm text-gray-600 mt-2">{review.comment}</p>
                                    </div>
                                ))}
                            {filterStar !== null && MOCK_REVIEWS.filter((r) => r.rating === filterStar).length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-6">Không có đánh giá {filterStar} sao nào</p>
                            )}
                        </div>

                        {/* Write review */}
                        {isAuthenticated ? (
                            <form onSubmit={handleSubmitReview} className="bg-gray-50 rounded-xl p-6 space-y-4">
                                <h4 className="text-sm font-semibold">Viết đánh giá của bạn</h4>
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Đánh giá</p>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setReviewRating(i)}
                                                className="p-0.5"
                                            >
                                                <Star
                                                    size={20}
                                                    className={i <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                                    rows={3}
                                    required
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent resize-none"
                                />
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-colors"
                                >
                                    Gửi đánh giá
                                </button>
                            </form>
                        ) : (
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Bạn cần đăng nhập để viết đánh giá</p>
                                <Link
                                    to="/login"
                                    state={{ from: { pathname: `/product/${id}` } }}
                                    className="inline-flex items-center gap-2 px-5 py-2 bg-brand-accent text-white text-sm font-semibold rounded-full hover:bg-brand-accent/90 transition-colors"
                                >
                                    Đăng nhập để đánh giá
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
