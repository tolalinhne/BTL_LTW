import type { UserBlogPost, BlogCategory } from '@/types/user.types';

// ===== Mock Data =====
const BLOG_CATEGORIES: BlogCategory[] = [
    { id: '1', name: 'Xu hướng', slug: 'xu-huong' },
    { id: '2', name: 'Phong cách', slug: 'phong-cach' },
    { id: '3', name: 'Mẹo thời trang', slug: 'meo-thoi-trang' },
    { id: '4', name: 'Tin tức', slug: 'tin-tuc' },
    { id: '5', name: 'Hậu trường', slug: 'hau-truong' },
];

const MOCK_BLOGS: UserBlogPost[] = [
    {
        id: '1',
        title: '10 Xu hướng thời trang Xuân Hè 2026 không thể bỏ lỡ',
        slug: '10-xu-huong-thoi-trang-xuan-he-2026',
        excerpt: 'Khám phá những xu hướng thời trang nổi bật nhất mùa Xuân Hè 2026, từ màu sắc pastel dịu dàng đến phom dáng oversized đầy phóng khoáng.',
        content: `
<h2>1. Pastel — Sắc màu chủ đạo</h2>
<p>Mùa Xuân Hè 2026 chứng kiến sự trở lại mạnh mẽ của gam màu pastel.</p>
<img src="https://picsum.photos/seed/blog-pastel/800/400" alt="Pastel fashion trend" />

<h2>2. Oversized — Thoải mái là trên hết</h2>
<p>Phom dáng oversized tiếp tục chinh phục các tín đồ thời trang.</p>

<h2>3. Cut-out — Táo bạo và quyến rũ</h2>
<p>Những đường cắt bất đối xứng trên váy, áo croptop tạo điểm nhấn sexy.</p>

<h2>4. Sustainability — Thời trang bền vững</h2>
<p>Xu hướng thời trang bền vững ngày càng được quan tâm.</p>
        `,
        thumbnail: 'https://picsum.photos/seed/blog1/800/500',
        category: BLOG_CATEGORIES[0],
        author: { name: 'Phương Linh', avatar: 'https://picsum.photos/seed/author1/100/100', role: 'Fashion Editor' },
        tags: ['xu hướng', 'xuân hè', '2026'],
        status: 'published',
        publishedAt: '2026-02-20T10:00:00Z',
        createdAt: '2026-02-18T08:00:00Z',
        readingTime: 5,
    },
    {
        id: '2',
        title: 'Cách phối đồ công sở vừa thanh lịch vừa thời thượng',
        slug: 'cach-phoi-do-cong-so-thanh-lich-va-thoi-thuong',
        excerpt: 'Bạn đang tìm kiếm outfit công sở vừa chỉn chu vừa trendy?',
        content: `
<h2>Nguyên tắc vàng: Less is More</h2>
<p>Phối đồ công sở không cần quá cầu kỳ.</p>

<h2>Đầu tư vào những item cơ bản</h2>
<p>Blazer, áo sơ mi trắng, quần tây, chân váy bút chì.</p>
        `,
        thumbnail: 'https://picsum.photos/seed/blog2/800/500',
        category: BLOG_CATEGORIES[1],
        author: { name: 'Thanh Hà', avatar: 'https://picsum.photos/seed/author2/100/100', role: 'Stylist' },
        tags: ['công sở', 'phối đồ', 'thanh lịch'],
        status: 'published',
        publishedAt: '2026-02-18T09:00:00Z',
        createdAt: '2026-02-16T08:00:00Z',
        readingTime: 4,
    },
    {
        id: '3',
        title: '5 Mẹo chọn size quần áo online không bao giờ sai',
        slug: '5-meo-chon-size-quan-ao-online',
        excerpt: 'Mua đồ online mà sợ lệch size? Đừng lo.',
        content: `
<h2>1. Đo số đo cơ thể chính xác</h2>
<p>Hãy dùng thước dây để đo các số đo quan trọng.</p>

<h2>2. Đọc kỹ bảng size</h2>
<p>Mỗi thương hiệu có bảng size riêng.</p>
        `,
        thumbnail: 'https://picsum.photos/seed/blog3/800/500',
        category: BLOG_CATEGORIES[2],
        author: { name: 'Phương Linh', avatar: 'https://picsum.photos/seed/author1/100/100', role: 'Fashion Editor' },
        tags: ['mẹo', 'mua sắm online', 'size'],
        status: 'published',
        publishedAt: '2026-02-15T14:00:00Z',
        createdAt: '2026-02-14T10:00:00Z',
        readingTime: 3,
    },
    {
        id: '4',
        title: 'LiLi Fashion ra mắt BST "Garden Bloom" — Xuân 2026',
        slug: 'lili-fashion-ra-mat-bst-garden-bloom-xuan-2026',
        excerpt: 'Lấy cảm hứng từ những cánh đồng hoa mùa xuân.',
        content: `
<h2>Cảm hứng từ thiên nhiên</h2>
<p>BST "Garden Bloom" được lấy cảm hứng từ những khu vườn hoa mùa xuân châu Âu.</p>
        `,
        thumbnail: 'https://picsum.photos/seed/blog4/800/500',
        category: BLOG_CATEGORIES[3],
        author: { name: 'Minh Anh', avatar: 'https://picsum.photos/seed/author3/100/100', role: 'Brand Manager' },
        tags: ['BST mới', 'Garden Bloom', 'xuân 2026'],
        status: 'published',
        publishedAt: '2026-02-10T08:00:00Z',
        createdAt: '2026-02-08T08:00:00Z',
        readingTime: 4,
    },
    {
        id: '5',
        title: 'Hậu trường chụp ảnh lookbook BST Signature tại Đà Lạt',
        slug: 'hau-truong-chup-anh-lookbook-bst-signature-da-lat',
        excerpt: 'Cùng nhìn lại những khoảnh khắc đáng nhớ.',
        content: `
<h2>Đà Lạt — Bối cảnh hoàn hảo</h2>
<p>Với khí hậu se lạnh và cảnh quan thơ mộng.</p>
        `,
        thumbnail: 'https://picsum.photos/seed/blog5/800/500',
        category: BLOG_CATEGORIES[4],
        author: { name: 'Thanh Hà', avatar: 'https://picsum.photos/seed/author2/100/100', role: 'Stylist' },
        tags: ['hậu trường', 'lookbook', 'Đà Lạt'],
        status: 'published',
        publishedAt: '2026-02-05T10:00:00Z',
        createdAt: '2026-02-03T08:00:00Z',
        readingTime: 4,
    },
    {
        id: '6',
        title: 'Color blocking — Nghệ thuật phối màu cho người mới bắt đầu',
        slug: 'color-blocking-nghe-thuat-phoi-mau',
        excerpt: 'Color blocking giúp outfit bạn nổi bật và cá tính hơn.',
        content: `
<h2>Color blocking là gì?</h2>
<p>Color blocking là kỹ thuật kết hợp các khối màu sắc tương phản.</p>
        `,
        thumbnail: 'https://picsum.photos/seed/blog6/800/500',
        category: BLOG_CATEGORIES[1],
        author: { name: 'Phương Linh', avatar: 'https://picsum.photos/seed/author1/100/100', role: 'Fashion Editor' },
        tags: ['phối màu', 'color blocking', 'mẹo'],
        status: 'published',
        publishedAt: '2026-02-01T09:00:00Z',
        createdAt: '2026-01-30T08:00:00Z',
        readingTime: 3,
    },
];

// ===== Service Functions (mock, sẵn sàng chuyển sang API) =====

export interface BlogListParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}

export function getCategories(): BlogCategory[] {
    return BLOG_CATEGORIES;
}

export function getBlogs(params: BlogListParams = {}): { data: UserBlogPost[]; total: number } {
    const { page = 1, limit = 6, search = '', category = '' } = params;

    let filtered = MOCK_BLOGS.filter((b) => b.status === 'published');

    if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
            (b) => b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q)
        );
    }

    if (category) {
        filtered = filtered.filter((b) => b.category.slug === category);
    }

    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), total: filtered.length };
}

export function getBlogBySlug(slug: string): UserBlogPost | undefined {
    return MOCK_BLOGS.find((b) => b.slug === slug && b.status === 'published');
}

export function getRelatedPosts(slug: string, limit = 3): UserBlogPost[] {
    const current = MOCK_BLOGS.find((b) => b.slug === slug);
    if (!current) return [];
    return MOCK_BLOGS.filter(
        (b) => b.slug !== slug && b.status === 'published' && b.category.id === current.category.id
    ).slice(0, limit);
}
