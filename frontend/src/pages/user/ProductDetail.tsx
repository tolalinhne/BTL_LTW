import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingBag, Minus, Plus, Truck, RotateCcw, ChevronRight, Star, Package } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useSale } from '@/contexts/SaleContext';
import { formatPrice } from '@/utils/formatPrice';
import api from '@/services/api';
import type { Product, Review } from '@/types/user.types';

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
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { isAuthenticated } = useAuth();
    const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
    const { enrichWithSale } = useSale();

    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState<'desc' | 'review'>('desc');
    const [reviewText, setReviewText] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [filterStar, setFilterStar] = useState<number | null>(null);
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [flyItems, setFlyItems] = useState<{ id: number; startX: number; startY: number; endX: number; endY: number; image: string }[]>([]);
    const addBtnRef = useRef<HTMLButtonElement>(null);
    let flyId = useRef(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const prodRes = await api.get(`/products/${slug}`);
                const prodData = prodRes.data?.data || prodRes.data;
                
                // Extract colors/sizes from variants if not present
                if (!prodData.colors && prodData.variants) {
                    prodData.colors = prodData.variants
                        .map((v: any) => v.color)
                        .filter(Boolean)
                        .filter((c: string, i: number, a: string[]) => a.indexOf(c) === i);
                }
                if (!prodData.sizes && prodData.variants) {
                    prodData.sizes = prodData.variants
                        .map((v: any) => v.size)
                        .filter(Boolean)
                        .filter((s: string, i: number, a: string[]) => a.indexOf(s) === i);
                }
                // Calculate total stock from variants
                if (prodData.stock === undefined && prodData.variants) {
                    prodData.stock = prodData.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0);
                }
                // Map avgRating to rating if needed
                if (prodData.rating === undefined && prodData.avgRating !== undefined) {
                    prodData.rating = prodData.avgRating;
                }
                
                setProduct(enrichWithSale(prodData));
                if (prodData.colors?.length > 0) setSelectedColor(prodData.colors[0]);
                if (prodData.sizes?.length > 0) setSelectedSize(prodData.sizes[0]);
                
                // Fetch reviews
                try {
                    const reviewRes = await api.get(`/products/${prodData.id}/reviews`);
                    // Shape: ApiResponse{ data: PagedResponse{ data: ReviewDto[] } }
                    const pagedData = reviewRes.data?.data;
                    const reviewList = pagedData?.data ?? pagedData?.items ?? pagedData ?? [];
                    setReviews(Array.isArray(reviewList) ? reviewList : []);
                } catch { /* reviews not critical */ }

            } catch (e) {
                console.error('Failed to fetch product:', e);
            } finally {
                setLoading(false);
            }
        };
        if (slug) fetchData();
    }, [slug]);

    const inWishlist = product ? isInWishlist(product.id) : false;
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    // Lấy link ảnh từ variant đang chọn
    const displayImage = useMemo(() => {
        if (!product) return '';
        if (product.variants && product.variants.length > 0) {
            // First check if current exact variant has image
            const v = product.variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);
            if (v && (v as any).imageUrl) return (v as any).imageUrl;
            
            // Fallback: any variant with same color that has an image
            const vColor = product.variants.find((v: any) => v.color === selectedColor && (v as any).imageUrl);
            if (vColor) return (vColor as any).imageUrl;
        }
        return product.image;
    }, [product, selectedColor, selectedSize]);

    // Nạp các size CÓ SẴN theo TỪNG MÀU
    const availableSizes = useMemo(() => {
        if (!product) return [];
        if (!product.variants || product.variants.length === 0) return product.sizes || [];
        // Lọc variant theo màu, lấy size độc nhất
        const variantsOfColor = product.variants.filter((v: any) => v.color === selectedColor && v.size);
        const sizes = variantsOfColor.map((v: any) => v.size);
        return Array.from(new Set(sizes));
    }, [product, selectedColor]);

    // Tự động nhảy sang size đầu tiên nếu size đang chọn màu trước đó không có ở màu này
    useEffect(() => {
        if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
            setSelectedSize(availableSizes[0]);
        }
    }, [availableSizes, selectedSize]);

    // Lấy SL tồn kho (stock) CỦA ĐÚNG VARIANT (Màu + Size) đang chọn
    const stock = useMemo(() => {
        if (!product) return 0;
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find((v: any) => v.color === selectedColor && v.size === selectedSize);
            return variant ? (variant.stock || 0) : 0;
        }
        return product.stock || 0;
    }, [product, selectedColor, selectedSize]);

    const isOutOfStock = stock === 0;

    // Reset quantity khi đổi variant
    useEffect(() => {
        setQuantity(1);
    }, [selectedColor, selectedSize]);

    const handleAddToCart = useCallback(() => {
        if (!product) return;
        if (!selectedSize) return alert('Vui lòng chọn size');
        if (isOutOfStock) return alert('Sản phẩm đã hết hàng');
        if (quantity > stock) return alert(`Chỉ còn ${stock} sản phẩm trong kho`);

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

        setTimeout(() => {
            setFlyItems((prev) => prev.filter((item) => item.id !== newId));
        }, 800);
    }, [selectedSize, selectedColor, quantity, addToCart, product, stock, isOutOfStock]);

    const handleToggleWishlist = useCallback(() => {
        if (!product) return;
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/product/${slug}` } } });
            return;
        }
        if (inWishlist) {
            removeFromWishlist(product.id);
        } else {
            addToWishlist(product);
        }
    }, [product, isAuthenticated, inWishlist, slug, navigate, addToWishlist, removeFromWishlist]);

    const handleSubmitReview = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setReviewError(null);
        setSubmittingReview(true);
        try {
            const res = await api.post('/reviews', {
                productId: product.id,
                rating: reviewRating,
                comment: reviewText,
            });
            const newReview = res.data?.data;
            if (newReview) {
                setReviews((prev) => [newReview, ...prev]);
            }
            setReviewText('');
            setReviewRating(5);
        } catch (err: any) {
            const status = err?.response?.status;
            const msg = err?.response?.data?.message;
            if (status === 403) {
                setReviewError('Bạn cần mua và nhận sản phẩm này trước khi đánh giá.');
            } else if (status === 409) {
                setReviewError('Bạn đã đánh giá sản phẩm này rồi.');
            } else {
                setReviewError(msg || 'Gửi đánh giá thất bại. Vui lòng thử lại.');
            }
        } finally {
            setSubmittingReview(false);
        }
    }, [product, reviewRating, reviewText]);

    if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-gray-400">Đang tải...</p></div>;
    if (!product) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-gray-500">Không tìm thấy sản phẩm</p></div>;

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
                    <img 
                        src={displayImage} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                            // Fallback to default product image if variant image fails (404)
                            if (e.currentTarget.src !== product.image) {
                                e.currentTarget.src = product.image;
                            } else {
                                // Double failure fallback
                                e.currentTarget.src = 'https://placehold.co/600x800/eeeeee/999999?text=No+Image';
                            }
                        }}
                    />
                </div>

                {/* Info */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-gray-500 uppercase tracking-wider">{product.category}</span>
                        {product.isNew && (
                            <span className="px-2 py-0.5 bg-brand-primary text-white text-[10px] font-bold rounded-full">MỚI</span>
                        )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold mb-2">{product.name}</h1>

                    {/* SKU */}
                    {product.sku && (
                        <p className="text-xs text-gray-400 font-mono mb-3">Mã hàng: {product.sku}</p>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                        <StarRating rating={Math.round(avgRating)} />
                        <span className="text-sm text-gray-400">({reviews.length} đánh giá)</span>
                    </div>

                    <div className="flex items-baseline gap-3 mb-4">
                        {product.salePrice ? (
                            <>
                                {/* Đang sale từ chương trình khuyến mãi */}
                                <span className="text-2xl font-bold text-red-500">{formatPrice(product.salePrice)}</span>
                                <span className="text-base text-gray-400 line-through">{formatPrice(product.price)}</span>
                                {product.discountPercent && (
                                    <span className="px-2 py-0.5 bg-red-100 text-red-500 text-xs font-bold rounded-full">
                                        -{product.discountPercent}%
                                    </span>
                                )}
                            </>
                        ) : product.originalPrice && product.originalPrice > product.price ? (
                            <>
                                {/* Giá gốc cao hơn giá bán — sản phẩm đang có giá ưu đãi */}
                                <span className="text-2xl font-bold text-red-500">{formatPrice(product.price)}</span>
                                <span className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                                <span className="px-2 py-0.5 bg-red-100 text-red-500 text-xs font-bold rounded-full">
                                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                                </span>
                            </>
                        ) : (
                            <span className="text-2xl font-bold text-brand-accent">{formatPrice(product.price)}</span>
                        )}
                    </div>

                    {/* Stock status */}
                    <div className="flex items-center gap-2 mb-6">
                        <Package size={14} className={isOutOfStock ? 'text-red-500' : 'text-green-500'} />
                        {isOutOfStock ? (
                            <span className="text-sm text-red-500 font-medium">Hết hàng</span>
                        ) : (
                            <span className="text-sm text-gray-600">
                                Còn <span className="font-semibold text-green-600">{stock}</span> sản phẩm
                            </span>
                        )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{product.description}</p>

                    {/* Color selector */}
                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Màu sắc</p>
                        <div className="flex gap-2">
                            {(product.colors || []).map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`w-9 h-9 rounded-full border-2 transition-all ${selectedColor === color ? 'border-brand-primary scale-110 shadow-md' : 'border-gray-200'
                                        }`}
                                    title={color}
                                >
                                    <span className="block w-full h-full rounded-full" style={{ backgroundColor: (product as any).variants?.find((v: any) => v.color === color)?.colorHex || color }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <p className="text-sm font-medium mb-3">Kích thước</p>
                        <div className="flex gap-2">
                            {availableSizes.map((size) => (
                                <button
                                    key={size as string}
                                    onClick={() => setSelectedSize(size as string)}
                                    className={`min-w-[3rem] h-10 px-3 rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                                        ? 'bg-brand-primary text-white border-brand-primary'
                                        : 'border-gray-200 text-gray-600 hover:border-brand-primary'
                                        }`}
                                >
                                    {size as string}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="mb-8">
                        <p className="text-sm font-medium mb-3">Số lượng</p>
                        <div className="flex items-center gap-3">
                            <div className="inline-flex items-center border border-gray-200 rounded-lg">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="p-2.5 text-gray-500 hover:text-brand-primary"
                                >
                                    <Minus size={16} />
                                </button>
                                <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                                <button
                                    onClick={() => {
                                        if (quantity < stock) {
                                            setQuantity(quantity + 1);
                                        }
                                    }}
                                    disabled={quantity >= stock}
                                    className="p-2.5 text-gray-500 hover:text-brand-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            {quantity >= stock && stock > 0 && (
                                <span className="text-xs text-orange-500">Đã đạt số lượng tối đa</span>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 mb-8">
                        <button
                            ref={addBtnRef}
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-brand-primary text-white font-semibold rounded-full hover:bg-brand-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingBag size={18} /> {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
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
                            {tab === 'desc' ? 'Mô tả' : `Đánh giá (${reviews.length})`}
                        </button>
                    ))}
                </div>

                {activeTab === 'desc' ? (
                    <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                        <p>{product.description}</p>
                        {product.detailedDescription && (
                            <div className="mt-6 p-5 bg-gray-50 rounded-xl">
                                <h4 className="text-sm font-semibold text-gray-900 mb-3">Thông tin chi tiết</h4>
                                {product.detailedDescription.split('\n').map((line, i) => (
                                    <p key={i} className="text-sm text-gray-600 mb-1">{line}</p>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Rating summary + filter */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 bg-gray-50 rounded-xl">
                            <div className="text-center min-w-[80px]">
                                <p className="text-4xl font-bold text-brand-primary">{avgRating.toFixed(1)}</p>
                                <StarRating rating={Math.round(avgRating)} size={16} />
                                <p className="text-xs text-gray-400 mt-1">{reviews.length} đánh giá</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setFilterStar(null)}
                                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${filterStar === null
                                        ? 'bg-brand-primary text-white border-brand-primary'
                                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-accent'
                                        }`}
                                >
                                    Tất cả ({reviews.length})
                                </button>
                                {[5, 4, 3, 2, 1].map((star) => {
                                    const count = reviews.filter((r: Review) => r.rating === star).length;
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

                        {/* Reviews list */}
                        <div className="space-y-6">
                            {reviews
                                .filter((r: Review) => filterStar === null || r.rating === filterStar)
                                .map((review: Review) => (
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
                            {filterStar !== null && reviews.filter((r: Review) => r.rating === filterStar).length === 0 && (
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
                                            <button key={i} type="button" onClick={() => setReviewRating(i)} className="p-0.5">
                                                <Star size={20} className={i <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
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
                                {reviewError && (
                                    <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{reviewError}</p>
                                )}
                                <button
                                    type="submit"
                                    disabled={submittingReview}
                                    className="px-6 py-2.5 bg-brand-primary text-white text-sm font-semibold rounded-full hover:bg-brand-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                                </button>
                            </form>

                        ) : (
                            <div className="bg-gray-50 rounded-xl p-6 text-center">
                                <p className="text-sm text-gray-500 mb-3">Bạn cần đăng nhập để viết đánh giá</p>
                                <Link
                                    to="/login"
                                    state={{ from: { pathname: `/product/${slug}` } }}
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
