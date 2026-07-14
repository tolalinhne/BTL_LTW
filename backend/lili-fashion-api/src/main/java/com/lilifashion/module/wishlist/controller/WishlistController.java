package com.lilifashion.module.wishlist.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.product.dto.ProductDto;
import com.lilifashion.module.product.repository.ProductRepository;
import com.lilifashion.module.wishlist.entity.Wishlist;
import com.lilifashion.module.wishlist.repository.WishlistRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "Danh sách yêu thích")
@SecurityRequirement(name = "Bearer")
public class WishlistController {

    private final WishlistRepository wishlistRepository;
    private final ProductRepository productRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách wishlist của tôi")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<ProductDto>>> getWishlist(
            @AuthenticationPrincipal User user) {
        List<ProductDto> products = wishlistRepository.findByUserId(user.getId()).stream()
                .map(w -> ProductDto.from(w.getProduct()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Thêm sản phẩm vào wishlist")
    public ResponseEntity<ApiResponse<String>> addToWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(user.getId(), productId);

        if (existing.isPresent()) {
            return ResponseEntity.ok(ApiResponse.success("added", "Sản phẩm đã có trong yêu thích"));
        } else {
            var product = productRepository.findById(productId)
                    .orElseThrow(() -> AppException.notFound("Sản phẩm"));
            Wishlist wishlist = Wishlist.builder().user(user).product(product).build();
            wishlistRepository.save(wishlist);
            return ResponseEntity.ok(ApiResponse.success("added", "Đã thêm vào yêu thích"));
        }
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Xóa sản phẩm khỏi wishlist")
    public ResponseEntity<ApiResponse<String>> removeFromWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {

        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(user.getId(), productId);

        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());
        }
        return ResponseEntity.ok(ApiResponse.success("removed", "Đã xóa khỏi yêu thích"));
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Kiểm tra sản phẩm có trong wishlist không")
    public ResponseEntity<ApiResponse<Boolean>> checkWishlist(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        boolean inWishlist = wishlistRepository.existsByUserIdAndProductId(user.getId(), productId);
        return ResponseEntity.ok(ApiResponse.success(inWishlist));
    }
}
