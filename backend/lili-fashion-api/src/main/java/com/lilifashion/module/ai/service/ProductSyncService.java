package com.lilifashion.module.ai.service;

import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.entity.ProductVariant;
import com.lilifashion.module.product.repository.ProductRepository;
import com.lilifashion.module.sale.entity.Sale;
import com.lilifashion.module.sale.repository.SaleRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Đồng bộ dữ liệu sản phẩm từ MySQL → Supabase Vector DB (knowledge_documents).
 * Mỗi sản phẩm ACTIVE được chuyển thành một document với embedding vector để chatbot tìm kiếm.
 */
@Slf4j
@Service
public class ProductSyncService {

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    // Dùng secondary key cho embedding để tách biệt quota với chat generation
    @Value("${app.gemini.api-key-secondary:}")
    private String geminiApiKeySecondary;

    @Value("${app.supabase.url}")
    private String supabaseUrl;

    @Value("${app.supabase.key}")
    private String supabaseKey;

    /** Trả về key tốt nhất để gọi Embedding API (ưu tiên secondary để giữ primary cho chat) */
    private String embeddingApiKey() {
        return (geminiApiKeySecondary != null && !geminiApiKeySecondary.isBlank())
                ? geminiApiKeySecondary
                : geminiApiKey;
    }

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;
    private final WebClient webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();

    private static final String EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";
    private static final NumberFormat VN_CURRENCY = NumberFormat.getInstance(new Locale("vi", "VN"));

    public ProductSyncService(ProductRepository productRepository, SaleRepository saleRepository) {
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    // ─── Sync single product (called after create/update) ────────

    @Async
    public void syncProduct(Product product) {
        if (product == null || product.getId() == null) return;
        if (product.getDeletedAt() != null || product.getStatus() != Product.ProductStatus.ACTIVE) {
            deleteProductDocument(product.getId());
            return;
        }

        try {
            String richText = buildProductRichText(product);
            List<Double> embedding = embedText(richText);

            // Upsert: delete old then insert new
            deleteProductDocumentInternal(product.getId());

            Map<String, Object> body = Map.of(
                "title", "product_" + product.getId() + ": " + product.getName(),
                "content", richText,
                "type", "PRODUCT",
                "embedding", embedding
            );

            webClient.post()
                    .uri(supabaseUrl + "/rest/v1/knowledge_documents")
                    .header("apikey", supabaseKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                    .header("Prefer", "return=minimal")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();

            log.info("✅ Synced product #{} '{}' to Supabase vector DB", product.getId(), product.getName());
        } catch (Exception e) {
            log.error("❌ Failed to sync product #{}: {}", product.getId(), e.getMessage());
        }
    }

    // ─── Delete product document ─────────────────────────────────

    @Async
    public void deleteProductDocument(Long productId) {
        deleteProductDocumentInternal(productId);
    }

    private void deleteProductDocumentInternal(Long productId) {
        try {
            webClient.delete()
                    .uri(supabaseUrl + "/rest/v1/knowledge_documents?title=like.product_" + productId + "%3A*")
                    .header("apikey", supabaseKey)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
        } catch (Exception e) {
            log.warn("Could not delete document for product #{}: {}", productId, e.getMessage());
        }
    }

    // ─── Full sync all active products ───────────────────────────

    public int syncAllProducts() {
        log.info("🔄 Starting full product sync to Supabase...");

        List<Product> activeProducts = productRepository.findByDeletedAtIsNull(
                org.springframework.data.domain.PageRequest.of(0, 10000)
        ).getContent().stream()
                .filter(p -> p.getStatus() == Product.ProductStatus.ACTIVE)
                .toList();

        int successCount = 0;
        for (Product product : activeProducts) {
            try {
                // Sync synchronously for full sync to avoid overwhelming API
                String richText = buildProductRichText(product);
                List<Double> embedding = embedText(richText);

                deleteProductDocumentInternal(product.getId());

                Map<String, Object> body = Map.of(
                    "title", "product_" + product.getId() + ": " + product.getName(),
                    "content", richText,
                    "type", "PRODUCT",
                    "embedding", embedding
                );

                webClient.post()
                        .uri(supabaseUrl + "/rest/v1/knowledge_documents")
                        .header("apikey", supabaseKey)
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                        .header("Prefer", "return=minimal")
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(body)
                        .retrieve()
                        .bodyToMono(Void.class)
                        .block();

                successCount++;
                log.info("  ✅ [{}/{}] Synced: {}", successCount, activeProducts.size(), product.getName());

                // Rate limit: 100ms delay between products
                Thread.sleep(100);
            } catch (Exception e) {
                log.error("  ❌ Failed to sync product #{}: {}", product.getId(), e.getMessage());
            }
        }

        log.info("🏁 Full sync completed: {}/{} products synced", successCount, activeProducts.size());
        return successCount;
    }

    // ─── Build rich-text representation for embedding ────────────

    private String buildProductRichText(Product product) {
        StringBuilder sb = new StringBuilder();

        sb.append("Sản phẩm: ").append(product.getName()).append("\n");

        if (product.getCategory() != null) {
            sb.append("Danh mục: ").append(product.getCategory().getName()).append("\n");
        }

        sb.append("Giá: ").append(formatPrice(product.getPrice())).append("đ").append("\n");

        if (product.getOriginalPrice() != null && product.getOriginalPrice().compareTo(product.getPrice()) > 0) {
            sb.append("Giá gốc: ").append(formatPrice(product.getOriginalPrice())).append("đ").append("\n");
        }

        // Check active sales
        try {
            List<Sale> activeSales = saleRepository.findAll().stream()
                    .filter(Sale::isActive)
                    .filter(s -> s.getProducts().stream().anyMatch(p -> p.getId().equals(product.getId())))
                    .toList();
            if (!activeSales.isEmpty()) {
                Sale sale = activeSales.get(0);
                sb.append("🔥 Đang giảm giá: ").append(sale.getDiscountPercent()).append("% (").append(sale.getName()).append(")\n");
                BigDecimal salePrice = product.getPrice().multiply(
                        BigDecimal.ONE.subtract(sale.getDiscountPercent().divide(BigDecimal.valueOf(100))));
                sb.append("Giá sau giảm: ").append(formatPrice(salePrice)).append("đ\n");
            }
        } catch (Exception e) {
            // Sale check non-critical
        }

        if (product.getDescription() != null && !product.getDescription().isBlank()) {
            sb.append("Mô tả: ").append(product.getDescription()).append("\n");
        }

        // Sizes & Colors from variants
        if (product.getVariants() != null && !product.getVariants().isEmpty()) {
            Set<String> sizes = product.getVariants().stream()
                    .map(ProductVariant::getSize)
                    .filter(s -> s != null && !s.equals("Default"))
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            Set<String> colors = product.getVariants().stream()
                    .map(ProductVariant::getColor)
                    .filter(c -> c != null && !c.equals("Default"))
                    .collect(Collectors.toCollection(LinkedHashSet::new));

            int totalStock = product.getVariants().stream()
                    .mapToInt(ProductVariant::getStock)
                    .sum();

            if (!sizes.isEmpty()) sb.append("Sizes: ").append(String.join(", ", sizes)).append("\n");
            if (!colors.isEmpty()) sb.append("Màu sắc: ").append(String.join(", ", colors)).append("\n");
            sb.append("Tồn kho: ").append(totalStock).append(" sản phẩm\n");
        }

        sb.append("Slug: ").append(product.getSlug()).append("\n");

        if (product.isBestSeller()) sb.append("⭐ Sản phẩm bán chạy\n");
        if (product.isNew()) sb.append("🆕 Sản phẩm mới\n");
        if (product.getAvgRating() != null && product.getAvgRating() > 0) {
            sb.append("Đánh giá: ").append(product.getAvgRating()).append("/5 (")
              .append(product.getReviewCount()).append(" reviews)\n");
        }

        return sb.toString();
    }

    private String formatPrice(BigDecimal price) {
        if (price == null) return "0";
        return VN_CURRENCY.format(price.longValue());
    }

    // ─── Embedding helper ────────────────────────────────────────

    private List<Double> embedText(String text) {
        Map<String, Object> requestBody = Map.of(
            "model", "models/gemini-embedding-001",
            "outputDimensionality", 768,
            "content", Map.of("parts", new Object[]{ Map.of("text", text) })
        );

        Map<?, ?> result = webClient.post()
                .uri(EMBEDDING_URL + "?key=" + embeddingApiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

        if (result != null && result.containsKey("embedding")) {
            Map<?, ?> embeddingMap = (Map<?, ?>) result.get("embedding");
            return (List<Double>) embeddingMap.get("values");
        }
        throw new RuntimeException("Failed to embed text");
    }
}
