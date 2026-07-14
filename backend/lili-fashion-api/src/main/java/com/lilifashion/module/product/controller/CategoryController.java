package com.lilifashion.module.product.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.product.entity.Category;
import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.repository.CategoryRepository;
import com.lilifashion.module.product.repository.ProductRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Danh mục sản phẩm")
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @GetMapping("/api/categories")
    @Operation(summary = "Danh sách danh mục (public)")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        List<CategoryDto> list = categoryRepository.findAll().stream()
                .map(c -> CategoryDto.from(c, productRepository.countByCategoryIdAndDeletedAtIsNull(c.getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/api/categories/{slug}")
    @Operation(summary = "Chi tiết danh mục theo slug (public)")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<CategoryDto>> getCategoryBySlug(@PathVariable String slug) {
        Category cat = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> AppException.notFound("Danh mục"));
        return ResponseEntity.ok(ApiResponse.success(
                CategoryDto.from(cat, productRepository.countByCategoryIdAndDeletedAtIsNull(cat.getId()))));
    }

    @GetMapping("/api/admin/categories")
    @Operation(summary = "Admin: Danh sách danh mục", security = @SecurityRequirement(name = "Bearer"))
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<CategoryDto>>> adminGetCategories() {
        List<CategoryDto> list = categoryRepository.findAll().stream()
                .map(c -> CategoryDto.from(c, productRepository.countByCategoryIdAndDeletedAtIsNull(c.getId())))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/api/admin/categories")
    @Operation(summary = "Admin: Tạo danh mục", security = @SecurityRequirement(name = "Bearer"))
    @Transactional
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.getSlug())) {
            throw AppException.conflict("Slug danh mục đã tồn tại");
        }
        Category cat = Category.builder()
                .name(request.getName())
                .slug(request.getSlug())
                .description(request.getDescription())
                .icon(request.getIcon())
                .imageUrl(request.getImageUrl())
                .isFeatured(request.isFeatured != null ? request.isFeatured : false)
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(CategoryDto.from(categoryRepository.save(cat), 0)));
    }

    @PutMapping("/api/admin/categories/{id}")
    @Operation(summary = "Admin: Cập nhật danh mục", security = @SecurityRequirement(name = "Bearer"))
    @Transactional
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable Long id, @RequestBody CategoryRequest request) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Danh mục"));
        if (request.getName() != null) cat.setName(request.getName());
        if (request.getDescription() != null) cat.setDescription(request.getDescription());
        if (request.getIcon() != null) cat.setIcon(request.getIcon());
        if (request.getImageUrl() != null) cat.setImageUrl(request.getImageUrl());
        if (request.isFeatured != null) cat.setIsFeatured(request.isFeatured);
        return ResponseEntity.ok(ApiResponse.success(
                CategoryDto.from(categoryRepository.save(cat),
                        productRepository.countByCategoryIdAndDeletedAtIsNull(cat.getId()))));
    }

    @PutMapping("/api/admin/categories/{id}/featured")
    @Operation(summary = "Admin: Toggle nổi bật danh mục", security = @SecurityRequirement(name = "Bearer"))
    @Transactional
    public ResponseEntity<ApiResponse<CategoryDto>> toggleFeatured(
            @PathVariable Long id, @RequestBody java.util.Map<String, Boolean> body) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Danh mục"));
        cat.setIsFeatured(body.getOrDefault("isFeatured", !(cat.getIsFeatured() != null && cat.getIsFeatured())));
        return ResponseEntity.ok(ApiResponse.success(
                CategoryDto.from(categoryRepository.save(cat),
                        productRepository.countByCategoryIdAndDeletedAtIsNull(cat.getId()))));
    }

    @DeleteMapping("/api/admin/categories/{id}")
    @Operation(summary = "Admin: Xóa danh mục", security = @SecurityRequirement(name = "Bearer"))
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        Category cat = categoryRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Danh mục"));
        
        long activeProductCount = productRepository.countByCategoryIdAndDeletedAtIsNull(cat.getId());
        long totalProductCount = productRepository.countByCategoryId(cat.getId());

        if (activeProductCount > 0) {
            throw AppException.badRequest("Không thể xóa danh mục \"" + cat.getName() 
                    + "\" vì đang có " + activeProductCount + " sản phẩm hoạt động. Hãy chuyển sản phẩm sang danh mục khác trước khi xóa.");
        }

        // Tự động gỡ liên kết danh mục đối với các sản phẩm đã bị xóa mềm/lưu trữ (để ngăn ngừa lỗi SQL Constraint)
        if (totalProductCount > 0 && activeProductCount == 0) {
            List<Product> deletedProducts = productRepository.findByCategoryId(cat.getId());
            for (Product p : deletedProducts) {
                p.setCategory(null);
            }
            productRepository.saveAll(deletedProducts);
        }

        try {
            categoryRepository.deleteById(id);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            throw AppException.badRequest("Không thể xóa danh mục vì đang bị ràng buộc bởi các dữ liệu khác (VD: banner, khuyến mãi).");
        }
        return ResponseEntity.ok(ApiResponse.success("Đã xóa danh mục trực tiếp, ngắt liên kết được " + (totalProductCount - activeProductCount) + " sp rác", null));
    }

    // ─── Inner DTOs ─────────────────────────────────────────

    @Data public static class CategoryRequest {
        @NotBlank private String name;
        @NotBlank private String slug;
        private String description; private String icon; private String imageUrl;
        @com.fasterxml.jackson.annotation.JsonProperty("isFeatured")
        private Boolean isFeatured;
    }

    @Data public static class CategoryDto {
        private Long id; private String name; private String slug;
        private String description; private String icon; private String imageUrl;
        private int productCount;
        @com.fasterxml.jackson.annotation.JsonProperty("isFeatured")
        private boolean isFeatured;
        static CategoryDto from(Category c, long productCount) {
            CategoryDto d = new CategoryDto();
            d.id = c.getId(); d.name = c.getName(); d.slug = c.getSlug();
            d.description = c.getDescription(); d.icon = c.getIcon();
            d.imageUrl = c.getImageUrl();
            d.productCount = (int) productCount;
            d.isFeatured = c.getIsFeatured() != null ? c.getIsFeatured() : false;
            return d;
        }
    }
}
