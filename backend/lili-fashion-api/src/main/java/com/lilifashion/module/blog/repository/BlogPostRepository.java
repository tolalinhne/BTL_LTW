package com.lilifashion.module.blog.repository;

import com.lilifashion.module.blog.entity.BlogPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPost, Long> {
    Optional<BlogPost> findBySlugAndStatus(String slug, BlogPost.BlogStatus status);
    Page<BlogPost> findByStatus(BlogPost.BlogStatus status, Pageable pageable);

    // Tìm theo tiêu đề (search)
    Page<BlogPost> findByStatusAndTitleContainingIgnoreCase(
            BlogPost.BlogStatus status, String title, Pageable pageable);

    // Lọc theo danh mục
    Page<BlogPost> findByStatusAndCategory(
            BlogPost.BlogStatus status, String category, Pageable pageable);

    // Lọc theo danh mục + tiêu đề
    Page<BlogPost> findByStatusAndCategoryAndTitleContainingIgnoreCase(
            BlogPost.BlogStatus status, String category, String title, Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM BlogPost p WHERE p.status = 'PUBLISHED' AND p.category IS NOT NULL")
    List<String> findDistinctCategories();
}
