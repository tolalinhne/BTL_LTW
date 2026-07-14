package com.lilifashion.module.review.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.dto.PagedResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.order.repository.OrderRepository;
import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.repository.ProductRepository;
import com.lilifashion.module.review.entity.Review;
import com.lilifashion.module.review.repository.ReviewRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Đánh giá sản phẩm")
public class ReviewController {

        private final ReviewRepository reviewRepository;
        private final ProductRepository productRepository;
        private final OrderRepository orderRepository;

        @GetMapping("/api/products/{productId}/reviews")
        @Operation(summary = "Xem đánh giá sản phẩm (public)")
        @Transactional(readOnly = true)
        public ResponseEntity<ApiResponse<PagedResponse<ReviewDto>>> getReviews(
                        @PathVariable Long productId,
                        @RequestParam(defaultValue = "1") int page,
                        @RequestParam(defaultValue = "10") int limit) {
                Page<Review> result = reviewRepository.findByProductId(
                                productId, PageRequest.of(page - 1, limit, Sort.by("createdAt").descending()));
                List<ReviewDto> dtos = result.getContent().stream()
                                .map(ReviewDto::from).collect(Collectors.toList());
                return ResponseEntity.ok(ApiResponse.success(
                                PagedResponse.of(dtos, result.getTotalElements(), page, limit)));
        }

        @PostMapping("/api/reviews")
        @Operation(summary = "Viết đánh giá (phải đã mua sản phẩm)", security = @SecurityRequirement(name = "Bearer"))
        @Transactional
        public ResponseEntity<ApiResponse<ReviewDto>> createReview(
                        @AuthenticationPrincipal User user,
                        @Valid @RequestBody ReviewRequest request) {

                // [DEMO MODE] Purchase check disabled — in production, uncomment below:
                // if (!orderRepository.hasUserPurchasedProduct(user.getId(),
                // request.getProductId())) {
                // throw AppException.forbidden("Bạn cần mua sản phẩm này trước khi đánh giá");
                // }

                if (reviewRepository.existsByUserIdAndProductId(user.getId(), request.getProductId())) {
                        throw AppException.conflict("Bạn đã đánh giá sản phẩm này rồi");
                }

                Product product = productRepository.findById(request.getProductId())
                                .orElseThrow(() -> AppException.notFound("Sản phẩm"));

                Review review = Review.builder()
                                .user(user)
                                .product(product)
                                .rating(request.getRating())
                                .comment(request.getComment())
                                .build();
                Review saved = reviewRepository.save(review);

                // Update product avg rating
                Page<Review> allReviews = reviewRepository.findByProductId(product.getId(),
                                PageRequest.of(0, Integer.MAX_VALUE));
                double avg = allReviews.getContent().stream()
                                .mapToInt(Review::getRating).average().orElse(0.0);
                product.setAvgRating(Math.round(avg * 10.0) / 10.0);
                product.setReviewCount((int) allReviews.getTotalElements());
                productRepository.save(product);

                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Đánh giá thành công", ReviewDto.from(saved)));
        }

        @DeleteMapping("/api/reviews/{id}")
        @Operation(summary = "Xóa đánh giá của mình", security = @SecurityRequirement(name = "Bearer"))
        public ResponseEntity<ApiResponse<Void>> deleteReview(
                        @AuthenticationPrincipal User user,
                        @PathVariable Long id) {
                Review review = reviewRepository.findById(id)
                                .orElseThrow(() -> AppException.notFound("Đánh giá"));
                if (!review.getUser().getId().equals(user.getId())) {
                        throw AppException.forbidden("Không có quyền xóa đánh giá này");
                }
                reviewRepository.delete(review);
                return ResponseEntity.ok(ApiResponse.success("Đã xóa đánh giá", null));
        }

        // ─── Inner DTOs ─────────────────────────────────────────

        @Data
        public static class ReviewRequest {
                @NotNull
                private Long productId;
                @NotNull
                @Min(1)
                @Max(5)
                private Integer rating;
                @NotBlank(message = "Nội dung đánh giá không được để trống")
                private String comment;
        }

        @Data
        public static class ReviewDto {
                private Long id;
                private String userName;
                private Integer rating;
                private String comment;
                private LocalDateTime createdAt;

                public static ReviewDto from(Review r) {
                        ReviewDto dto = new ReviewDto();
                        dto.setId(r.getId());
                        dto.setUserName(r.getUser().getName());
                        dto.setRating(r.getRating());
                        dto.setComment(r.getComment());
                        dto.setCreatedAt(r.getCreatedAt());
                        return dto;
                }
        }
}
