package com.lilifashion.config;

import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.auth.entity.User.UserRole_Enum;
import com.lilifashion.module.auth.repository.UserRepository;
import com.lilifashion.module.blog.entity.BlogPost;
import com.lilifashion.module.blog.entity.BlogPost.BlogStatus;
import com.lilifashion.module.blog.repository.BlogPostRepository;
import com.lilifashion.module.product.entity.Category;
import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.entity.Product.ProductStatus;
import com.lilifashion.module.product.entity.ProductImage;
import com.lilifashion.module.product.entity.ProductVariant;
import com.lilifashion.module.product.repository.CategoryRepository;
import com.lilifashion.module.product.repository.ProductRepository;
import com.lilifashion.module.rbac.entity.Permission;
import com.lilifashion.module.rbac.entity.Role;
import com.lilifashion.module.rbac.entity.RolePermission;
import com.lilifashion.module.rbac.repository.PermissionRepository;
import com.lilifashion.module.rbac.repository.RoleRepository;
import com.lilifashion.module.review.entity.Review;
import com.lilifashion.module.review.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seed dữ liệu mẫu khi ứng dụng khởi động.
 * Chỉ seed nếu database trống (kiểm tra bảng users).
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final BlogPostRepository blogPostRepository;
    private final ReviewRepository reviewRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // ALWAYS reset admin password (even if DB already has data)
        resetAdminPasswords();
        // ALWAYS seed reviews if table is empty (needed for demo)
        seedReviewsIfEmpty();

        if (userRepository.count() > 1) { // >1 because we may have just created admin
            log.info("✅ Database đã có dữ liệu — bỏ qua seed (admin password đã reset).");
            return;
        }

        log.info("🌱 Bắt đầu seed dữ liệu mẫu...");

        seedCategories();
        seedPermissions();
        seedRoles();
        seedUsers();
        seedProducts();
        seedBlogPosts();

        log.info("✅ Seed dữ liệu hoàn tất!");
    }

    private void seedCategories() {
        List<Category> cats = List.of(
            buildCategory("Áo", "ao", "Áo thời trang các loại", "👕"),
            buildCategory("Quần", "quan", "Quần thời trang các loại", "👖"),
            buildCategory("Đầm & Váy", "dam-vay", "Đầm váy thanh lịch", "👗"),
            buildCategory("Phụ kiện", "phu-kien", "Túi xách, mũ, thắt lưng", "👜"),
            buildCategory("Sale", "sale", "Sản phẩm khuyến mãi", "🏷️")
        );
        categoryRepository.saveAll(cats);
        log.info("  → {} danh mục", cats.size());
    }

    private void seedPermissions() {
        List<Permission> perms = List.of(
            buildPermission("product.create", "Tạo sản phẩm", false),
            buildPermission("product.update", "Sửa sản phẩm", false),
            buildPermission("product.delete", "Xóa sản phẩm", true),
            buildPermission("product.view", "Xem quản lý sản phẩm", false),
            buildPermission("order.manage", "Quản lý đơn hàng", false),
            buildPermission("blog.write", "Viết bài blog", false),
            buildPermission("blog.delete", "Xóa bài blog", true),
            buildPermission("staff.manage", "Quản lý nhân viên", true)
        );
        permissionRepository.saveAll(perms);
        log.info("  → {} quyền", perms.size());
    }

    private void seedRoles() {
        Permission orderManage = permissionRepository.findByKey("order.manage").orElse(null);
        Permission blogWrite = permissionRepository.findByKey("blog.write").orElse(null);
        Permission blogDelete = permissionRepository.findByKey("blog.delete").orElse(null);
        Permission productView = permissionRepository.findByKey("product.view").orElse(null);
        Permission productCreate = permissionRepository.findByKey("product.create").orElse(null);
        Permission productUpdate = permissionRepository.findByKey("product.update").orElse(null);
        Permission productDelete = permissionRepository.findByKey("product.delete").orElse(null);

        Role orderStaff = buildRole("order-staff", "Nhân viên xử lý đơn hàng", "#3B82F6");
        if (orderManage != null) orderStaff.getRolePermissions().add(buildRolePermission(orderStaff, orderManage));
        roleRepository.save(orderStaff);

        Role contentManager = buildRole("content-manager", "Quản lý nội dung blog", "#8B5CF6");
        if (blogWrite != null) contentManager.getRolePermissions().add(buildRolePermission(contentManager, blogWrite));
        if (blogDelete != null) contentManager.getRolePermissions().add(buildRolePermission(contentManager, blogDelete));
        if (productView != null) contentManager.getRolePermissions().add(buildRolePermission(contentManager, productView));
        roleRepository.save(contentManager);

        Role productManager = buildRole("product-manager", "Quản lý sản phẩm", "#10B981");
        if (productCreate != null) productManager.getRolePermissions().add(buildRolePermission(productManager, productCreate));
        if (productUpdate != null) productManager.getRolePermissions().add(buildRolePermission(productManager, productUpdate));
        if (productDelete != null) productManager.getRolePermissions().add(buildRolePermission(productManager, productDelete));
        if (productView != null) productManager.getRolePermissions().add(buildRolePermission(productManager, productView));
        roleRepository.save(productManager);

        log.info("  → 3 vai trò");
    }

    private void seedReviewsIfEmpty() {
        if (reviewRepository.count() > 0) return;

        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == User.UserRole_Enum.MEMBER ||
                             u.getRole() == User.UserRole_Enum.ADMIN)
                .limit(2).toList();

        List<Product> products = productRepository.findAll().stream().limit(4).toList();

        if (customers.isEmpty() || products.isEmpty()) {
            log.warn("  ⚠️ Không đủ users/products để seed reviews");
            return;
        }

        User u1 = customers.get(0);
        User u2 = customers.size() > 1 ? customers.get(1) : customers.get(0);

        String[][] reviewData = {
            {"Sản phẩm rất đẹp, chất liệu tốt, giao hàng nhanh!", "5", "0"},
            {"Màu sắc đúng như hình, size chuẩn, rất hài lòng.", "4", "0"},
            {"Chất vải mịn, đường may chắc chắn. Sẽ mua lại.", "5", "1"},
            {"Đẹp nhưng giao hơi chậm. Sản phẩm thì oke.", "4", "1"},
            {"Xuất sắc! Mặc rất thoải mái, đúng với mô tả.", "5", "2"},
            {"Giá hợp lý, chất lượng tốt cho mức giá này.", "4", "3"},
        };

        for (String[] rd : reviewData) {
            int pIdx = Integer.parseInt(rd[2]);
            if (pIdx >= products.size()) continue;
            Product prod = products.get(pIdx);
            User reviewer = Integer.parseInt(rd[2]) % 2 == 0 ? u1 : u2;

            // Avoid duplicate user+product combo
            if (reviewRepository.existsByUserIdAndProductId(reviewer.getId(), prod.getId())) continue;

            reviewRepository.save(Review.builder()
                    .user(reviewer)
                    .product(prod)
                    .rating(Integer.parseInt(rd[1]))
                    .comment(rd[0])
                    .build());
        }
        log.info("  → Đã seed reviews mẫu");
    }

    /**
     * ALWAYS reset admin/staff passwords on startup to ensure login works.
     */
    private void resetAdminPasswords() {
        String encodedPassword = passwordEncoder.encode("Admin@123");

        // Admin user
        User admin = userRepository.findByEmail("admin@lilifashion.vn").orElse(null);
        if (admin != null) {
            admin.setPassword(encodedPassword);
            admin.setActive(true);
            userRepository.save(admin);
            log.info("🔑 Admin password reset to: Admin@123");
        } else {
            userRepository.save(User.builder()
                    .name("LILI Admin").email("admin@lilifashion.vn")
                    .password(encodedPassword).phone("0901234567")
                    .role(UserRole_Enum.ADMIN).active(true).build());
            log.info("🔑 Admin user created with password: Admin@123");
        }

        // Staff user
        User staff = userRepository.findByEmail("staff@lilifashion.vn").orElse(null);
        if (staff != null) {
            staff.setPassword(encodedPassword);
            staff.setActive(true);
            userRepository.save(staff);
            log.info("🔑 Staff password reset to: Admin@123");
        } else {
            userRepository.save(User.builder()
                    .name("Trần Văn Khánh").email("staff@lilifashion.vn")
                    .password(encodedPassword).phone("0912345678")
                    .role(UserRole_Enum.STAFF).active(true).build());
            log.info("🔑 Staff user created with password: Admin@123");
        }
    }

    private void seedUsers() {
        // Password cho tất cả tài khoản demo: Admin@123
        String encodedPassword = passwordEncoder.encode("Admin@123");

        // Admin user — update password if already exists
        User admin = userRepository.findByEmail("admin@lilifashion.vn")
                .map(u -> { u.setPassword(encodedPassword); u.setActive(true); return u; })
                .orElseGet(() -> User.builder()
                        .name("LILI Admin").email("admin@lilifashion.vn")
                        .password(encodedPassword).phone("0901234567")
                        .role(UserRole_Enum.ADMIN).active(true).build());
        userRepository.save(admin);

        // Staff user
        User staff = userRepository.findByEmail("staff@lilifashion.vn")
                .map(u -> { u.setPassword(encodedPassword); u.setActive(true); return u; })
                .orElseGet(() -> User.builder()
                        .name("Trần Văn Khánh").email("staff@lilifashion.vn")
                        .password(encodedPassword).phone("0912345678")
                        .role(UserRole_Enum.STAFF).active(true).build());
        userRepository.save(staff);

        // Customer user
        User customer = userRepository.findByEmail("mai@example.com")
                .map(u -> { u.setPassword(encodedPassword); u.setActive(true); return u; })
                .orElseGet(() -> User.builder()
                        .name("Nguyễn Thị Mai").email("mai@example.com")
                        .password(encodedPassword).phone("0987654321")
                        .role(UserRole_Enum.MEMBER).active(true).build());
        userRepository.save(customer);

        log.info("  → 3 tài khoản (password: Admin@123)");
    }

    private void seedProducts() {
        Category catAo = categoryRepository.findBySlug("ao").orElse(null);
        Category catQuan = categoryRepository.findBySlug("quan").orElse(null);
        Category catDamVay = categoryRepository.findBySlug("dam-vay").orElse(null);
        Category catPhuKien = categoryRepository.findBySlug("phu-kien").orElse(null);

        if (catAo == null || catQuan == null || catDamVay == null || catPhuKien == null) {
            log.warn("  ⚠️ Không tìm thấy đủ danh mục — bỏ qua seed sản phẩm");
            return;
        }

        // --- Product 1: Áo thun ---
        Product p1 = buildProduct("Áo Thun Basic Trắng", "ao-thun-basic-trang",
                "Áo thun basic cotton 100%, thoáng mát, phù hợp mọi dịp.",
                299000, 399000,
                "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg",
                catAo, 45, 4.5, 12, true, false);
        p1.getVariants().addAll(List.of(
            buildVariant(p1, "S", "Trắng", "#FFFFFF", 50, "ATBT-S-WHITE"),
            buildVariant(p1, "M", "Trắng", "#FFFFFF", 80, "ATBT-M-WHITE"),
            buildVariant(p1, "L", "Trắng", "#FFFFFF", 60, "ATBT-L-WHITE"),
            buildVariant(p1, "XL", "Trắng", "#FFFFFF", 30, "ATBT-XL-WHITE"),
            buildVariant(p1, "S", "Đen", "#000000", 40, "ATBT-S-BLACK"),
            buildVariant(p1, "M", "Đen", "#000000", 60, "ATBT-M-BLACK")
        ));
        p1.getImages().add(buildImage(p1, "https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg", true));

        // --- Product 2: Quần jeans ---
        Product p2 = buildProduct("Quần Jeans Skinny Xanh", "quan-jeans-skinny-xanh",
                "Quần jeans skinny co giãn nhẹ, ôm dáng chuẩn, màu xanh đậm thời thượng.",
                599000, 799000,
                "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg",
                catQuan, 89, 4.8, 34, false, true);
        p2.getVariants().addAll(List.of(
            buildVariant(p2, "28", "Xanh đậm", "#1E3A5F", 40, "QJS-28-BLUE"),
            buildVariant(p2, "29", "Xanh đậm", "#1E3A5F", 55, "QJS-29-BLUE"),
            buildVariant(p2, "30", "Xanh đậm", "#1E3A5F", 70, "QJS-30-BLUE"),
            buildVariant(p2, "31", "Xanh đậm", "#1E3A5F", 45, "QJS-31-BLUE")
        ));
        p2.getImages().add(buildImage(p2, "https://images.pexels.com/photos/1082529/pexels-photo-1082529.jpeg", true));

        // --- Product 3: Đầm hoa ---
        Product p3 = buildProduct("Đầm Hoa Mùa Hè", "dam-hoa-mua-he",
                "Đầm hoa nhẹ nhàng, chất liệu voan mát, phù hợp đi chơi và dạo phố.",
                450000, 599000,
                "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg",
                catDamVay, 67, 4.3, 21, true, false);
        p3.getVariants().addAll(List.of(
            buildVariant(p3, "S", "Hồng hoa", "#FFB6C1", 30, "DHM-S-PINK"),
            buildVariant(p3, "M", "Hồng hoa", "#FFB6C1", 45, "DHM-M-PINK"),
            buildVariant(p3, "L", "Hồng hoa", "#FFB6C1", 25, "DHM-L-PINK")
        ));
        p3.getImages().add(buildImage(p3, "https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg", true));

        // --- Product 4: Túi tote ---
        Product p4 = buildProduct("Túi Tote Canvas Be", "tui-tote-canvas-be",
                "Túi tote canvas chắc chắn, sức chứa lớn, màu be trung tính dễ mix đồ.",
                350000, 450000,
                "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg",
                catPhuKien, 123, 4.7, 56, false, true);
        p4.getVariants().addAll(List.of(
            buildVariant(p4, "Free", "Be", "#F5F5DC", 100, "TTC-FREE-BEIGE"),
            buildVariant(p4, "Free", "Đen", "#000000", 80, "TTC-FREE-BLACK")
        ));
        p4.getImages().add(buildImage(p4, "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg", true));

        // --- Product 5: Blazer ---
        Product p5 = buildProduct("Áo Blazer Nữ Classic", "ao-blazer-nu-classic",
                "Áo blazer nữ dáng suông, phong cách thanh lịch, phù hợp đi làm và dự tiệc.",
                789000, 990000,
                "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg",
                catAo, 35, 4.6, 18, true, true);
        p5.getVariants().addAll(List.of(
            buildVariant(p5, "S", "Đen", "#000000", 25, "ABN-S-BLACK"),
            buildVariant(p5, "M", "Đen", "#000000", 35, "ABN-M-BLACK"),
            buildVariant(p5, "L", "Trắng kem", "#FFFDD0", 20, "ABN-L-CREAM")
        ));
        p5.getImages().add(buildImage(p5, "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg", true));

        // --- Product 6: Váy midi ---
        Product p6 = buildProduct("Váy Midi Xếp Ly", "vay-midi-xep-ly",
                "Váy midi xếp ly thanh lịch, chất liệu mềm mại, phù hợp đi làm và dạo phố.",
                520000, 680000,
                "https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg",
                catDamVay, 54, 4.4, 15, false, false);
        p6.getVariants().addAll(List.of(
            buildVariant(p6, "S", "Đen", "#000000", 30, "VMX-S-BLACK"),
            buildVariant(p6, "M", "Đen", "#000000", 40, "VMX-M-BLACK"),
            buildVariant(p6, "M", "Be", "#F5F5DC", 25, "VMX-M-BEIGE")
        ));
        p6.getImages().add(buildImage(p6, "https://images.pexels.com/photos/1007018/pexels-photo-1007018.jpeg", true));

        productRepository.saveAll(List.of(p1, p2, p3, p4, p5, p6));
        log.info("  → 6 sản phẩm + variants + images");
    }

    private void seedBlogPosts() {
        User admin = userRepository.findByEmail("admin@lilifashion.vn").orElse(null);
        if (admin == null) {
            log.warn("  ⚠️ Không tìm thấy admin — bỏ qua seed blog");
            return;
        }

        blogPostRepository.saveAll(List.of(
            BlogPost.builder()
                .title("Xu hướng thời trang Hè 2026")
                .slug("xu-huong-thoi-trang-he-2026")
                .excerpt("Khám phá những xu hướng thời trang mới nhất cho mùa hè 2026 cùng LILI Fashion.")
                .content("<p>Mùa hè 2026 mang đến làn gió mới...</p><h2>1. Tông màu Pastel</h2><p>Nhẹ nhàng, thanh lịch...</p>")
                .thumbnail("https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg")
                .category("Xu hướng")
                .author(admin)
                .status(BlogStatus.PUBLISHED)
                .publishedAt(LocalDateTime.now())
                .readingTime(5)
                .build(),
            BlogPost.builder()
                .title("Cách phối đồ công sở thanh lịch")
                .slug("cach-phoi-do-cong-so-thanh-lich")
                .excerpt("Hướng dẫn phối đồ công sở đẹp, chuyên nghiệp cho phái nữ hiện đại.")
                .content("<p>Trang phục công sở không nhất thiết phải nhàm chán...</p><h2>1. Blazer + Quần âu</h2><p>Chuẩn thanh lịch...</p>")
                .thumbnail("https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg")
                .category("Phong cách")
                .author(admin)
                .status(BlogStatus.PUBLISHED)
                .publishedAt(LocalDateTime.now())
                .readingTime(4)
                .build()
        ));
        log.info("  → 2 bài blog");
    }

    // ─── Builder helpers ─────────────────────────────────────────

    private Category buildCategory(String name, String slug, String desc, String icon) {
        return Category.builder().name(name).slug(slug).description(desc).icon(icon).build();
    }

    private Permission buildPermission(String key, String label, boolean danger) {
        return Permission.builder().key(key).label(label).danger(danger).build();
    }

    private Role buildRole(String name, String desc, String color) {
        return Role.builder().name(name).description(desc).color(color).system(false).build();
    }

    private RolePermission buildRolePermission(Role role, Permission perm) {
        return RolePermission.builder().role(role).permission(perm).build();
    }

    private Product buildProduct(String name, String slug, String desc,
                                  long price, long originalPrice, String imageUrl,
                                  Category category, int sold, double rating, int reviews,
                                  boolean isNew, boolean isBestSeller) {
        return Product.builder()
                .name(name).slug(slug).description(desc)
                .price(BigDecimal.valueOf(price))
                .originalPrice(BigDecimal.valueOf(originalPrice))
                .imageUrl(imageUrl)
                .category(category)
                .status(ProductStatus.ACTIVE)
                .soldCount(sold).avgRating(rating).reviewCount(reviews)
                .isNew(isNew).isBestSeller(isBestSeller)
                .build();
    }

    private ProductVariant buildVariant(Product product, String size, String color,
                                         String colorHex, int stock, String sku) {
        return ProductVariant.builder()
                .product(product).size(size).color(color)
                .colorHex(colorHex).stock(stock).sku(sku)
                .build();
    }

    private ProductImage buildImage(Product product, String url, boolean primary) {
        return ProductImage.builder()
                .product(product).url(url).primary(primary)
                .build();
    }
}
