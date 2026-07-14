package com.lilifashion.module.blog.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.dto.PagedResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.blog.entity.BlogPost;
import com.lilifashion.module.blog.entity.BlogPost.BlogStatus;
import com.lilifashion.module.blog.entity.BlogTag;
import com.lilifashion.module.blog.repository.BlogPostRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@Tag(name = "Blog", description = "Blog / CMS")
public class BlogController {

    private final BlogPostRepository blogPostRepository;
    private final com.lilifashion.module.blog.repository.BlogTagRepository blogTagRepository;

    // ─── Public APIs ─────────────────────────────────────────────

    @GetMapping("/api/blog/categories")
    @Operation(summary = "Danh sách danh mục blog (public)")
    public ResponseEntity<ApiResponse<List<java.util.Map<String, String>>>> getBlogCategories() {
        List<String> cats = blogPostRepository.findDistinctCategories();
        List<java.util.Map<String, String>> result = cats.stream()
                .filter(c -> c != null && !c.isBlank())
                .map(c -> java.util.Map.of(
                        "id", c.toLowerCase().replace(" ", "-"),
                        "name", c,
                        "slug", c.toLowerCase().replace(" ", "-")
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/api/blog")
    @Operation(summary = "Danh sách bài viết published (public)")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<PagedResponse<BlogDto>>> getPublishedPosts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {

        PageRequest pageable = PageRequest.of(page - 1, limit, Sort.by("publishedAt").descending());
        Page<BlogPost> result;

        boolean hasSearch = search != null && !search.isBlank();
        boolean hasCategory = category != null && !category.isBlank();

        // Nếu category là slug (vd: "xu-huong"), tìm name gốc trong DB
        String categoryName = null;
        if (hasCategory) {
            categoryName = blogPostRepository.findDistinctCategories().stream()
                    .filter(c -> c != null
                            && (c.equals(category)
                            || c.toLowerCase().replace(" ", "-").equals(category)))
                    .findFirst()
                    .orElse(category); // fallback: dùng nguyên giá trị gửi lên
        }

        if (hasCategory && hasSearch) {
            result = blogPostRepository.findByStatusAndCategoryAndTitleContainingIgnoreCase(
                    BlogStatus.PUBLISHED, categoryName, search, pageable);
        } else if (hasCategory) {
            result = blogPostRepository.findByStatusAndCategory(
                    BlogStatus.PUBLISHED, categoryName, pageable);
        } else if (hasSearch) {
            result = blogPostRepository.findByStatusAndTitleContainingIgnoreCase(
                    BlogStatus.PUBLISHED, search, pageable);
        } else {
            result = blogPostRepository.findByStatus(BlogStatus.PUBLISHED, pageable);
        }

        return ResponseEntity.ok(ApiResponse.success(
                PagedResponse.of(result.getContent().stream().map(BlogDto::from).collect(Collectors.toList()),
                        result.getTotalElements(), page, limit)));
    }

    @GetMapping("/api/blog/{slug}")
    @Operation(summary = "Chi tiết bài viết (public)")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<BlogDto>> getPostBySlug(@PathVariable String slug) {
        BlogPost post = blogPostRepository.findBySlugAndStatus(slug, BlogStatus.PUBLISHED)
                .orElseThrow(() -> AppException.notFound("Bài viết"));
        return ResponseEntity.ok(ApiResponse.success(BlogDto.from(post)));
    }

    @GetMapping("/api/blog/{slug}/related")
    @Operation(summary = "Bài viết liên quan (public)")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<BlogDto>>> getRelatedPosts(
            @PathVariable String slug,
            @RequestParam(defaultValue = "3") int limit) {
        // Find the current post to get its category
        BlogPost current = blogPostRepository.findBySlugAndStatus(slug, BlogStatus.PUBLISHED)
                .orElse(null);
        // Get recent published posts excluding current
        Page<BlogPost> result = blogPostRepository.findByStatus(
                BlogStatus.PUBLISHED,
                PageRequest.of(0, limit + 1, Sort.by("publishedAt").descending()));
        List<BlogDto> related = result.getContent().stream()
                .filter(p -> !p.getSlug().equals(slug))
                .limit(limit)
                .map(BlogDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(related));
    }

    // ─── Admin APIs ───────────────────────────────────────────────

    @GetMapping("/api/admin/blog")
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('blog.write')")
    @Operation(summary = "Admin: Tất cả bài viết", security = @SecurityRequirement(name = "Bearer"))
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<BlogDto>>> adminGetAllPosts() {
        List<BlogDto> posts = blogPostRepository.findAll(Sort.by("createdAt").descending())
                .stream().map(BlogDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(posts));
    }

    @PostMapping("/api/admin/blog")
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('blog.write')")
    @Operation(summary = "Admin: Tạo bài viết", security = @SecurityRequirement(name = "Bearer"))
    @Transactional
    public ResponseEntity<ApiResponse<BlogDto>> createPost(
            @AuthenticationPrincipal User author,
            @Valid @RequestBody BlogRequest request) {

        // Resolve tags: find existing or create new
        List<BlogTag> resolvedTags = new ArrayList<>();
        if (request.getTags() != null) {
            for (String tagName : request.getTags()) {
                String tagSlug = tagName.toLowerCase().replace(" ", "-");
                BlogTag tag = blogTagRepository.findBySlug(tagSlug)
                        .orElseGet(() -> blogTagRepository.save(
                                BlogTag.builder().name(tagName).slug(tagSlug).build()));
                resolvedTags.add(tag);
            }
        }

        BlogPost post = BlogPost.builder()
                .title(request.getTitle())
                .slug(request.getSlug())
                .excerpt(request.getExcerpt())
                .content(request.getContent())
                .thumbnail(request.getThumbnail())
                .category(request.getCategory())
                .author(author)
                .status(BlogStatus.valueOf(request.getStatus().toUpperCase()))
                .readingTime(request.getReadingTime() != null ? request.getReadingTime() : 5)
                .publishedAt(request.getStatus().equalsIgnoreCase("PUBLISHED") ? LocalDateTime.now() : null)
                .tags(resolvedTags)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo bài viết thành công", BlogDto.from(blogPostRepository.save(post))));
    }

    @GetMapping("/api/admin/blog/{id}")
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('blog.write')")
    @Operation(summary = "Admin: Chi tiết bài viết theo ID", security = @SecurityRequirement(name = "Bearer"))
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<BlogDto>> adminGetPostById(@PathVariable Long id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Bài viết"));
        return ResponseEntity.ok(ApiResponse.success(BlogDto.from(post)));
    }

    @PutMapping("/api/admin/blog/{id}")
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('blog.write')")
    @Operation(summary = "Admin: Cập nhật bài viết", security = @SecurityRequirement(name = "Bearer"))
    @Transactional
    public ResponseEntity<ApiResponse<BlogDto>> updatePost(
            @PathVariable Long id, @RequestBody BlogRequest request) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Bài viết"));

        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getContent() != null) post.setContent(request.getContent());
        if (request.getExcerpt() != null) post.setExcerpt(request.getExcerpt());
        if (request.getThumbnail() != null) post.setThumbnail(request.getThumbnail());
        if (request.getStatus() != null) {
            BlogStatus newStatus = BlogStatus.valueOf(request.getStatus().toUpperCase());
            if (newStatus == BlogStatus.PUBLISHED && post.getPublishedAt() == null) {
                post.setPublishedAt(LocalDateTime.now());
            }
            post.setStatus(newStatus);
        }
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công",
                BlogDto.from(blogPostRepository.save(post))));
    }

    @DeleteMapping("/api/admin/blog/{id}")
    @PreAuthorize("hasAnyRole('ADMIN') or hasAuthority('blog.delete')")
    @Operation(summary = "Admin: Xóa bài viết", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        BlogPost post = blogPostRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Bài viết"));
        blogPostRepository.delete(post);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa bài viết", null));
    }

    // ─── Inner DTOs ─────────────────────────────────────────

    @Data
    public static class BlogRequest {
        @NotBlank
        private String title;
        @NotBlank
        private String slug;
        private String excerpt;
        private String content;
        private String thumbnail;
        private String category;
        private List<String> tags;
        private String status = "draft";
        private Integer readingTime;
    }

    @Data
    public static class BlogDto {
        private Long id;
        private String title;
        private String slug;
        private String excerpt;
        private String content;
        private String thumbnail;
        private String category;
        private String author;
        private String authorAvatar;
        private List<String> tags;
        private String status;
        private LocalDateTime publishedAt;
        private LocalDateTime createdAt;
        private Integer readingTime;

        public static BlogDto from(BlogPost p) {
            BlogDto dto = new BlogDto();
            dto.setId(p.getId());
            dto.setTitle(p.getTitle());
            dto.setSlug(p.getSlug());
            dto.setExcerpt(p.getExcerpt());
            dto.setContent(p.getContent());
            dto.setThumbnail(p.getThumbnail());
            dto.setCategory(p.getCategory());
            dto.setAuthor(p.getAuthor() != null ? p.getAuthor().getName() : "LILI Fashion");
            dto.setAuthorAvatar(p.getAuthor() != null ? p.getAuthor().getAvatar() : null);
            dto.setTags(p.getTags().stream().map(BlogTag::getName).collect(Collectors.toList()));
            dto.setStatus(p.getStatus().name().toLowerCase());
            dto.setPublishedAt(p.getPublishedAt());
            dto.setCreatedAt(p.getCreatedAt());
            dto.setReadingTime(p.getReadingTime());
            return dto;
        }
    }
}
