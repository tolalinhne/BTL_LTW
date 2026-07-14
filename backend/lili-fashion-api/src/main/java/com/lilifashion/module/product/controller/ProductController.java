package com.lilifashion.module.product.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.dto.PagedResponse;
import com.lilifashion.module.product.dto.ProductDto;
import com.lilifashion.module.product.dto.ProductRequest;
import com.lilifashion.module.product.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
@Tag(name = "Products", description = "Quản lý sản phẩm")
public class ProductController {

    private final ProductService productService;

    // ─── Public APIs ─────────────────────────────────────────────

    @GetMapping("/api/products")
    @Operation(summary = "Danh sách sản phẩm (public, có filter, phân trang)")
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto>>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String search,   // alias frontend dùng
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String size,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        // Ưu tiên `search` (gửi từ FE), fallback `keyword` (backward compat)
        String effectiveKeyword = (search != null && !search.isBlank()) ? search : keyword;

        PagedResponse<ProductDto> result = productService.getProducts(
                category, effectiveKeyword, minPrice, maxPrice, size, sort, page, limit);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/api/products/featured")
    @Operation(summary = "Sản phẩm nổi bật (isBestSeller = true, public)")
    public ResponseEntity<ApiResponse<java.util.List<ProductDto>>> getFeaturedProducts(
            @RequestParam(defaultValue = "8") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getFeaturedProducts(limit)));
    }

    @GetMapping("/api/products/{slug}")
    @Operation(summary = "Chi tiết sản phẩm theo slug (public)")
    public ResponseEntity<ApiResponse<ProductDto>> getProductBySlug(
            @PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(productService.getBySlug(slug)));
    }

    // ─── Admin APIs ───────────────────────────────────────────────

    @GetMapping("/api/admin/products")
    // Role check handled by SecurityConfig: /api/admin/** requires ADMIN or STAFF
    @Operation(summary = "Admin: Danh sách tất cả sản phẩm", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<PagedResponse<ProductDto>>> adminGetProducts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProductsAdmin(page, limit)));
    }

    @GetMapping("/api/admin/products/{id}")
    @Operation(summary = "Admin: Chi tiết sản phẩm", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<ProductDto>> adminGetProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @PostMapping("/api/admin/products")
    @Operation(summary = "Admin: Tạo sản phẩm mới", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Valid @RequestBody ProductRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sản phẩm thành công", productService.createProduct(request)));
    }

    @PostMapping(value = "/api/admin/products/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Admin: Tạo sản phẩm mới (Multipart)", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<ProductDto>> createProductMultipart(
            @RequestParam("name") String name,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam("category") String categorySlug,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "originalPrice", required = false) BigDecimal originalPrice,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam(value = "detailedDescription", required = false) String detailedDescription,
            @RequestParam("status") String status,
            @RequestParam(value = "colors", required = false) String colors,
            @RequestParam(value = "sizes", required = false) String sizes,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        
        ProductDto dto = productService.createProductMultipart(
            name, sku, categorySlug, price, originalPrice, stock, shortDescription, 
            detailedDescription, status, colors, sizes, images
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sản phẩm thành công", dto));
    }

    @PutMapping("/api/admin/products/{id}")
    @Operation(summary = "Admin: Cập nhật sản phẩm", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", productService.updateProduct(id, request)));
    }

    @PutMapping(value = "/api/admin/products/{id}/multipart", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Admin: Cập nhật sản phẩm (Multipart)", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<ProductDto>> updateProductMultipart(
            @PathVariable Long id,
            @RequestParam("name") String name,
            @RequestParam(value = "sku", required = false) String sku,
            @RequestParam("category") String categorySlug,
            @RequestParam("price") BigDecimal price,
            @RequestParam(value = "originalPrice", required = false) BigDecimal originalPrice,
            @RequestParam("stock") Integer stock,
            @RequestParam(value = "shortDescription", required = false) String shortDescription,
            @RequestParam(value = "detailedDescription", required = false) String detailedDescription,
            @RequestParam("status") String status,
            @RequestParam(value = "colors", required = false) String colors,
            @RequestParam(value = "sizes", required = false) String sizes,
            @RequestParam(value = "existingImages", required = false) String existingImages,
            @RequestParam(value = "images", required = false) MultipartFile[] images) {
        
        ProductDto dto = productService.updateProductMultipart(
            id, name, sku, categorySlug, price, originalPrice, stock, shortDescription, 
            detailedDescription, status, colors, sizes, existingImages, images
        );
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công", dto));
    }

    @DeleteMapping("/api/admin/products/{id}")
    @Operation(summary = "Admin: Xóa sản phẩm (soft delete)", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sản phẩm thành công", null));
    }

    @PatchMapping("/api/admin/products/{id}/toggle-featured")
    @Operation(summary = "Admin: Bật/tắt nổi bật sản phẩm", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<ProductDto>> toggleFeatured(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", productService.toggleFeatured(id)));
    }
}
