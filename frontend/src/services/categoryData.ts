// Shared category mock data — single source of truth for admin + user pages

export interface CategoryItem {
    id: string;
    name: string;
    slug: string;
    description: string;
    productCount: number;
    isFeatured: boolean;
}

const CATEGORIES_KEY = 'lili_categories';

// MAX_FEATURED: max items that fit on one row (~6 on large screens)
const MAX_FEATURED = 6;

const DEFAULT_CATEGORIES: CategoryItem[] = [
    { id: '1', name: 'Đầm', slug: 'dresses', description: 'Các loại đầm, váy nữ', productCount: 42, isFeatured: true },
    { id: '2', name: 'Áo', slug: 'tops', description: 'Áo sơ mi, áo kiểu, áo thun', productCount: 86, isFeatured: true },
    { id: '3', name: 'Quần', slug: 'pants', description: 'Quần dài, quần short, quần jeans', productCount: 34, isFeatured: true },
    { id: '4', name: 'Phụ kiện', slug: 'accessories', description: 'Túi xách, trang sức, khăn', productCount: 28, isFeatured: true },
    { id: '5', name: 'Signature', slug: 'signature', description: 'Bộ sưu tập thiết kế đặc biệt', productCount: 15, isFeatured: true },
];

function loadCategories(): CategoryItem[] {
    try {
        const stored = localStorage.getItem(CATEGORIES_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return DEFAULT_CATEGORIES;
}

function saveCategories(categories: CategoryItem[]) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function getAllCategories(): CategoryItem[] {
    return loadCategories();
}

export function getFeaturedCategories(): CategoryItem[] {
    return loadCategories().filter((c) => c.isFeatured);
}

export function addCategory(cat: Omit<CategoryItem, 'id' | 'productCount'>): CategoryItem[] {
    const categories = loadCategories();
    const newCat: CategoryItem = { ...cat, id: String(Date.now()), productCount: 0 };
    categories.push(newCat);
    saveCategories(categories);
    return categories;
}

export function updateCategory(id: string, updates: Partial<CategoryItem>): CategoryItem[] {
    const categories = loadCategories();
    const idx = categories.findIndex((c) => c.id === id);
    if (idx !== -1) categories[idx] = { ...categories[idx], ...updates };
    saveCategories(categories);
    return categories;
}

export function deleteCategory(id: string): CategoryItem[] {
    const categories = loadCategories().filter((c) => c.id !== id);
    saveCategories(categories);
    return categories;
}

export function toggleFeatured(id: string): CategoryItem[] {
    const categories = loadCategories();
    const cat = categories.find((c) => c.id === id);
    if (!cat) return categories;

    const currentFeaturedCount = categories.filter((c) => c.isFeatured).length;
    if (!cat.isFeatured && currentFeaturedCount >= MAX_FEATURED) {
        alert(`Tối đa ${MAX_FEATURED} danh mục nổi bật (vừa 1 hàng trên màn hình lớn)!`);
        return categories;
    }

    cat.isFeatured = !cat.isFeatured;
    saveCategories(categories);
    return categories;
}

export { MAX_FEATURED };
