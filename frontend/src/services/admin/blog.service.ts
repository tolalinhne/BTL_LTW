import type { AdminBlogPost, BlogFormData } from '@/types/admin.types';

// ===== Mock Data =====
const BLOG_CATEGORIES = ['Xu hướng', 'Phong cách', 'Mẹo thời trang', 'Tin tức', 'Hậu trường'];

let MOCK_BLOGS: AdminBlogPost[] = [
    {
        id: '1',
        title: '10 Xu hướng thời trang Xuân Hè 2026 không thể bỏ lỡ',
        slug: '10-xu-huong-thoi-trang-xuan-he-2026',
        excerpt: 'Khám phá những xu hướng thời trang nổi bật nhất mùa Xuân Hè 2026.',
        content: '<h2>Pastel — Sắc màu chủ đạo</h2><p>Mùa Xuân Hè 2026 chứng kiến sự trở lại mạnh mẽ của gam màu pastel.</p>',
        thumbnail: 'https://picsum.photos/seed/blog1/800/500',
        category: 'Xu hướng',
        author: 'Phương Linh',
        tags: ['xu hướng', 'xuân hè'],
        status: 'published',
        publishedAt: '2026-02-20T10:00:00Z',
        createdAt: '2026-02-18T08:00:00Z',
    },
    {
        id: '2',
        title: 'Cách phối đồ công sở vừa thanh lịch vừa thời thượng',
        slug: 'cach-phoi-do-cong-so-thanh-lich-va-thoi-thuong',
        excerpt: 'Bạn đang tìm kiếm outfit công sở vừa chỉn chu vừa trendy?',
        content: '<h2>Nguyên tắc vàng: Less is More</h2><p>Phối đồ công sở không cần quá cầu kỳ.</p>',
        thumbnail: 'https://picsum.photos/seed/blog2/800/500',
        category: 'Phong cách',
        author: 'Thanh Hà',
        tags: ['công sở', 'phối đồ'],
        status: 'published',
        publishedAt: '2026-02-18T09:00:00Z',
        createdAt: '2026-02-16T08:00:00Z',
    },
    {
        id: '3',
        title: '5 Mẹo chọn size quần áo online không bao giờ sai',
        slug: '5-meo-chon-size-quan-ao-online',
        excerpt: 'Mua đồ online mà sợ lệch size? Đừng lo!',
        content: '<h2>Đo số đo cơ thể chính xác</h2><p>Hãy dùng thước dây để đo các số đo quan trọng.</p>',
        thumbnail: 'https://picsum.photos/seed/blog3/800/500',
        category: 'Mẹo thời trang',
        author: 'Phương Linh',
        tags: ['mẹo', 'mua sắm online'],
        status: 'draft',
        publishedAt: '',
        createdAt: '2026-02-14T10:00:00Z',
    },
];

let nextId = 4;

// ===== Service Functions =====

export function getBlogCategories(): string[] {
    return BLOG_CATEGORIES;
}

export function getBlogs(): AdminBlogPost[] {
    return [...MOCK_BLOGS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getBlogById(id: string): AdminBlogPost | undefined {
    return MOCK_BLOGS.find((b) => b.id === id);
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/Đ/g, 'D')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export function createBlog(data: BlogFormData): AdminBlogPost {
    const newPost: AdminBlogPost = {
        ...data,
        id: String(nextId++),
        slug: data.slug || generateSlug(data.title),
        author: 'Admin',
        publishedAt: data.status === 'published' ? new Date().toISOString() : '',
        createdAt: new Date().toISOString(),
    };
    MOCK_BLOGS.push(newPost);
    return newPost;
}

export function updateBlog(id: string, data: BlogFormData): AdminBlogPost | undefined {
    const index = MOCK_BLOGS.findIndex((b) => b.id === id);
    if (index === -1) return undefined;
    MOCK_BLOGS[index] = {
        ...MOCK_BLOGS[index],
        ...data,
        slug: data.slug || generateSlug(data.title),
        publishedAt:
            data.status === 'published' && !MOCK_BLOGS[index].publishedAt
                ? new Date().toISOString()
                : MOCK_BLOGS[index].publishedAt,
    };
    return MOCK_BLOGS[index];
}

export function deleteBlog(id: string): boolean {
    const before = MOCK_BLOGS.length;
    MOCK_BLOGS = MOCK_BLOGS.filter((b) => b.id !== id);
    return MOCK_BLOGS.length < before;
}
