package com.lilifashion.module.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.lilifashion.module.ai.controller.ChatController.ChatResponse;
import com.lilifashion.module.ai.controller.ChatController.RecommendedProduct;
import com.lilifashion.module.product.entity.Product;
import com.lilifashion.module.product.repository.ProductRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class RagService {

    @Value("${app.gemini.api-key}")
    private String geminiApiKey;

    @Value("${app.gemini.api-key-secondary:}")
    private String geminiApiKeySecondary;

    @Value("${app.gemini.api-key-tertiary:}")
    private String geminiApiKeyTertiary;

    @Value("${app.gemini.api-url}")
    private String geminiApiUrl;

    @Value("${app.supabase.url}")
    private String supabaseUrl;

    @Value("${app.supabase.key}")
    private String supabaseKey;

    private final ProductRepository productRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final WebClient webClient = WebClient.builder()
            .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();

    private static final String EMBEDDING_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

    // ─── Conversation Memory ─────────────────────────────────
    // Lưu trữ lịch sử chat theo session (max 20 messages trước khi summarize)
    private final Map<String, List<Map<String, Object>>> chatHistory = new ConcurrentHashMap<>();
    // Lưu trữ conversation summary khi history bị truncate
    private final Map<String, String> conversationSummaries = new ConcurrentHashMap<>();

    private static final int MAX_HISTORY_SIZE = 20;
    private static final int KEEP_RECENT_COUNT = 10;

    // ─── Rate limiter: max 8 calls/min, thread-safe ─────────────
    private static final long MIN_CALL_INTERVAL_MS = 7_500; // 7.5s = 8 calls/min (safe under 10 RPM)
    private final java.util.concurrent.locks.ReentrantLock geminiLock = new java.util.concurrent.locks.ReentrantLock(true);
    private volatile long lastGeminiCallTime = 0;

    // ─── Key rotation: round-robin across up to 3 keys when quota exhausted ──
    // exhaustedKeys tracks which keys have hit their daily limit (reset every 24h)
    private final Set<String> exhaustedKeys = ConcurrentHashMap.newKeySet();
    private volatile long firstExhaustionAt = 0;
    private static final long KEY_RESET_INTERVAL_MS = 24 * 60 * 60 * 1000L; // 24h

    // System instruction
    private static final String SYSTEM_INSTRUCTION = """
        Bạn là AI tư vấn thời trang của LILI Fashion. Nhiệm vụ duy nhất là gợi ý sản phẩm từ catalog được cung cấp.

        QUY TẮC BẮT BUỘC:
        1. Trả lời ngắn gọn (1-2 câu chào hỏi/tư vấn), thân thiện, dùng emoji (✨🎀👗).
        2. Chọn 3-5 sản phẩm PHÙ HỢP nhất từ [CATALOG SẢN PHẨM] bên dưới dựa theo yêu cầu của khách.
        3. TUYỆT ĐỐI KHÔNG liệt kê sản phẩm bằng văn bản (không gạch đầu dòng, không in tên/giá/size).
        4. Dòng CUỐI CÙNG PHẢI là tag (không có gì sau tag này): RECOMMEND:[id1,id2,id3]
           Ví dụ: RECOMMEND:[5,12,3,8]
        5. KHÔNG bịa ID ngoài danh sách catalog.
        """;

    public RagService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }


    // ═══════════════════════════════════════════════════════════
    // MAIN CHAT METHOD
    // ═══════════════════════════════════════════════════════════

    @Transactional(readOnly = true)
    public ChatResponse chat(String userMessage, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            sessionId = UUID.randomUUID().toString();
        }

        log.info("Chat request - session: {}, message: {}", sessionId, userMessage);

        // ── Step 1: Get relevant products via Supabase semantic search (PRIMARY) ──
        List<Product> relevantProducts = getRelevantProductsFromSupabase(userMessage);

        // ── Step 2: Fallback to full MySQL catalog if Supabase empty ──
        if (relevantProducts.isEmpty()) {
            log.info("[CHAT] Supabase returned no results → fallback to MySQL catalog");
            relevantProducts = loadAllActiveProducts();
        } else {
            log.info("[CHAT] Supabase returned {} relevant products", relevantProducts.size());
        }

        // ── Step 3: Build product map & catalog string ──
        Map<Long, Product> productMap = relevantProducts.stream()
                .collect(Collectors.toMap(Product::getId, p -> p));
        String productCatalog = buildCatalogString(relevantProducts);
        log.info("[CHAT] Catalog: {} products, {} chars", relevantProducts.size(), productCatalog.length());

        // ── Step 4: Call Gemini ──
        try {
            String reply = callGeminiWithMemory(userMessage, productCatalog, "", sessionId);
            log.info("[CHAT] Raw AI reply: {}", reply.length() > 600 ? reply.substring(0, 600) + "..." : reply);

            // ── Step 5: Parse RECOMMEND tag → resolve from in-memory map ──
            List<RecommendedProduct> recommendations = new ArrayList<>();
            java.util.regex.Pattern rp = java.util.regex.Pattern.compile("RECOMMEND:\\s*\\[([\\d,\\s]+)\\]");
            java.util.regex.Matcher rm = rp.matcher(reply);
            if (!rm.find()) {
                log.warn("[CHAT] No RECOMMEND tag found in AI reply!");
            } else {
                String idsStr = rm.group(1);
                log.info("[CHAT] RECOMMEND IDs: {}", idsStr);
                for (String idStr : idsStr.split(",")) {
                    try {
                        Long pid = Long.parseLong(idStr.trim());
                        Product product = productMap.get(pid);
                        if (product != null) {
                            RecommendedProduct rec = new RecommendedProduct();
                            rec.setId(product.getId());
                            rec.setName(product.getName());
                            rec.setSlug(product.getSlug());
                            rec.setPrice(product.getPrice());
                            rec.setOriginalPrice(product.getOriginalPrice());
                            rec.setImageUrl(product.getImageUrl());
                            rec.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
                            recommendations.add(rec);
                        } else {
                            log.warn("[CHAT] Product ID {} not in catalog (hallucinated?)", pid);
                        }
                    } catch (Exception ex) {
                        log.warn("[CHAT] Failed to parse ID '{}': {}", idStr, ex.getMessage());
                    }
                }
                reply = reply.replaceAll("RECOMMEND:\\s*\\[.*?\\]", "").trim();
            }

            ChatResponse response = new ChatResponse();
            response.setReply(reply);
            response.setSessionId(sessionId);
            response.setRecommendedProducts(recommendations);
            response.setReferences(List.of());
            log.info("Chat done — {} product(s) recommended", recommendations.size());
            return response;

        } catch (Exception e) {
            log.warn("[CHAT] Gemini unavailable, using smart fallback: {}", e.getMessage());
            return smartFallback(userMessage, relevantProducts, sessionId);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // SMART FALLBACK — Keyword-based recommendation (no AI needed)
    // ═══════════════════════════════════════════════════════════

    private ChatResponse smartFallback(String userMessage, List<Product> catalog, String sessionId) {
        log.info("[FALLBACK] Generating smart keyword-based response for: {}", userMessage);
        String lower = userMessage.toLowerCase();

        // ── 1. Keyword → filter products ────────────────────────
        List<Product> filtered = catalog;

        if (matchesAny(lower, "bán chạy", "best seller", "phổ biến", "hot", "bán nhiều")) {
            filtered = catalog.stream().filter(Product::isBestSeller).collect(Collectors.toList());
        } else if (matchesAny(lower, "mới", "new", "mới nhất", "ra mới", "hàng mới")) {
            filtered = catalog.stream().filter(Product::isNew).collect(Collectors.toList());
        } else if (matchesAny(lower, "váy", "đầm", "skirt", "dress")) {
            filtered = filterByKeyword(catalog, "váy", "đầm", "dress", "skirt");
        } else if (matchesAny(lower, "áo", "shirt", "blouse", "top")) {
            filtered = filterByKeyword(catalog, "áo", "shirt", "blouse", "top");
        } else if (matchesAny(lower, "quần", "pants", "trouser", "short")) {
            filtered = filterByKeyword(catalog, "quần", "pants", "trouser", "short");
        } else if (matchesAny(lower, "set", "bộ", "combo")) {
            filtered = filterByKeyword(catalog, "set", "bộ", "combo");
        } else if (matchesAny(lower, "giảm giá", "sale", "khuyến mãi", "discount", "rẻ")) {
            filtered = catalog.stream()
                    .filter(p -> p.getOriginalPrice() != null
                            && p.getOriginalPrice().compareTo(p.getPrice()) > 0)
                    .collect(Collectors.toList());
        } else if (matchesAny(lower, "đi làm", "công sở", "office", "formal")) {
            filtered = filterByKeyword(catalog, "công sở", "office", "formal", "đi làm", "vest", "blazer");
        } else if (matchesAny(lower, "đi chơi", "dạo phố", "casual", "năng động")) {
            filtered = filterByKeyword(catalog, "casual", "năng động", "dạo phố", "đi chơi", "basic");
        } else if (matchesAny(lower, "dự tiệc", "tiệc", "party", "event", "sang trọng")) {
            filtered = filterByKeyword(catalog, "tiệc", "party", "dự tiệc", "sang trọng", "evening");
        }

        if (filtered.isEmpty()) filtered = catalog; // fallback to full catalog

        // ── 2. Score & sort: best seller first, then new, then order by id ──
        filtered = filtered.stream()
                .sorted(Comparator.comparingInt((Product p) -> (p.isBestSeller() ? 0 : 1))
                        .thenComparingInt(p -> (p.isNew() ? 0 : 1)))
                .limit(4)
                .collect(Collectors.toList());

        // ── 3. Generate natural Vietnamese response ──────────────
        String reply = buildFallbackReply(lower, filtered.size());

        // ── 4. Build recommended products ────────────────────────
        List<RecommendedProduct> recs = filtered.stream().map(p -> {
            RecommendedProduct rec = new RecommendedProduct();
            rec.setId(p.getId());
            rec.setName(p.getName());
            rec.setSlug(p.getSlug());
            rec.setPrice(p.getPrice());
            rec.setOriginalPrice(p.getOriginalPrice());
            rec.setImageUrl(p.getImageUrl());
            rec.setCategoryName(p.getCategory() != null ? p.getCategory().getName() : null);
            return rec;
        }).collect(Collectors.toList());

        ChatResponse response = new ChatResponse();
        response.setReply(reply);
        response.setSessionId(sessionId);
        response.setRecommendedProducts(recs);
        response.setReferences(List.of());
        log.info("[FALLBACK] Smart response generated — {} products recommended", recs.size());
        return response;
    }

    private boolean matchesAny(String text, String... keywords) {
        for (String kw : keywords) {
            if (text.contains(kw)) return true;
        }
        return false;
    }

    private List<Product> filterByKeyword(List<Product> catalog, String... keywords) {
        return catalog.stream()
                .filter(p -> {
                    String haystack = ((p.getName() != null ? p.getName() : "") + " "
                            + (p.getDescription() != null ? p.getDescription() : "") + " "
                            + (p.getCategory() != null && p.getCategory().getName() != null
                               ? p.getCategory().getName() : "")).toLowerCase();
                    for (String kw : keywords) {
                        if (haystack.contains(kw)) return true;
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }

    private String buildFallbackReply(String lowerMsg, int count) {
        if (matchesAny(lowerMsg, "bán chạy", "best seller", "phổ biến", "hot")) {
            return "Đây là những sản phẩm bán chạy nhất tại LILI Fashion! ⭐ Được rất nhiều khách hàng yêu thích nhé!";
        } else if (matchesAny(lowerMsg, "mới", "new", "mới nhất")) {
            return "Hàng mới về xinh lắm bạn ơi! 🆕✨ Mình gợi ý cho bạn những sản phẩm mới nhất nhé!";
        } else if (matchesAny(lowerMsg, "váy", "đầm")) {
            return "Váy đẹp thì LILI có rất nhiều! 👗🎀 Mình chọn cho bạn một vài mẫu hot nhất nhé!";
        } else if (matchesAny(lowerMsg, "áo")) {
            return "Áo đẹp cho mọi dịp! ✨ Đây là những mẫu áo được yêu thích nhất tại LILI nhé bạn!";
        } else if (matchesAny(lowerMsg, "giảm giá", "sale", "khuyến mãi")) {
            return "Mình tìm ngay những sản phẩm đang giảm giá hot nhất cho bạn! 🔥💸";
        } else if (matchesAny(lowerMsg, "đi làm", "công sở")) {
            return "Trang phục công sở vừa thanh lịch vừa năng động! 💼✨ Mình gợi ý cho bạn nhé!";
        } else if (matchesAny(lowerMsg, "đi chơi", "dạo phố", "casual")) {
            return "Outfit đi chơi phải vừa thoải mái vừa trendy! 🌟 Xem qua mấy mẫu này bạn ơi!";
        } else if (matchesAny(lowerMsg, "dự tiệc", "tiệc", "party")) {
            return "Dự tiệc mà mặc đẹp thì ai cũng phải ngoái nhìn! 🥂✨ Xem những mẫu này nhé!";
        } else if (matchesAny(lowerMsg, "size", "1m6", "1m65", "1m7", "kg", "cân")) {
            return "Mình gợi ý một số sản phẩm phù hợp cho bạn nhé! 📏✨ LILI có đầy đủ size từ XS đến XL đó!";
        }
        // Generic
        String[] generics = {
            "Mình tìm được " + count + " sản phẩm phù hợp với yêu cầu của bạn! ✨",
            "LILI có rất nhiều sản phẩm đẹp, đây là gợi ý của mình cho bạn! 🎀",
            "Xem qua những sản phẩm này nhé, mình nghĩ bạn sẽ thích! 👗✨"
        };
        return generics[(int)(System.currentTimeMillis() % generics.length)];
    }

    // ─── PRIMARY: Get relevant products via Supabase vector search ─

    private List<Product> getRelevantProductsFromSupabase(String query) {
        try {
            if (supabaseKey == null || !supabaseKey.contains("eyJhbGciOiJIUzI1NiIs")) {
                return List.of(); // Supabase not configured → trigger fallback
            }

            List<Double> queryVector = embedText(query);
            List<Map<?, ?>> docs = searchSimilarDocuments(queryVector);

            if (docs.isEmpty()) return List.of();

            // Extract product IDs from title format "product_10: Product Name"
            List<Long> productIds = docs.stream()
                    .map(doc -> doc.get("title") != null ? doc.get("title").toString() : "")
                    .filter(title -> title.startsWith("product_"))
                    .map(title -> {
                        try {
                            String afterPrefix = title.substring("product_".length());
                            return Long.parseLong(afterPrefix.split(":")[0].trim());
                        } catch (Exception e) { return null; }
                    })
                    .filter(id -> id != null)
                    .collect(Collectors.toList());

            if (productIds.isEmpty()) return List.of();

            // Load those specific products from MySQL (for up-to-date price/stock data)
            List<Product> found = new ArrayList<>(productRepository.findAllById(productIds));
            return found.stream()
                    .filter(p -> p.getDeletedAt() == null && p.getStatus() == Product.ProductStatus.ACTIVE)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.warn("[CHAT] Supabase search failed (will use fallback): {}", e.getMessage());
            return List.of();
        }
    }

    // ─── FALLBACK: Load all active products from MySQL ────────────

    private List<Product> loadAllActiveProducts() {
        try {
            return productRepository.findAll().stream()
                    .filter(p -> p.getDeletedAt() == null && p.getStatus() == Product.ProductStatus.ACTIVE)
                    .limit(80)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Could not load active products: {}", e.getMessage());
            return List.of();
        }
    }

    // ─── Build catalog string for AI prompt ──────────────────────

    private String buildCatalogString(List<Product> products) {
        if (products.isEmpty()) return "";
        StringBuilder sb = new StringBuilder("[CATALOG SẢN PHẨM]\n");
        for (Product p : products) {
            sb.append("ID:").append(p.getId())
              .append(" | TÊN:").append(p.getName());
            if (p.getCategory() != null) {
                sb.append(" | DANH MỤC:").append(p.getCategory().getName());
            }
            sb.append(" | GIÁ:").append(p.getPrice()).append("\n");
        }
        sb.append("[/CATALOG SẢN PHẨM]");
        return sb.toString();
    }

    // ═══════════════════════════════════════════════════════════
    // KNOWLEDGE UPLOAD (Admin manual)
    // ═══════════════════════════════════════════════════════════

    public void uploadKnowledge(String title, String content, String type) {
        log.info("Uploading knowledge: {} ({})", title, type);
        try {
            List<Double> embedding = embedText(content);

            Map<String, Object> body = Map.of(
                "title", title,
                "content", content,
                "type", type,
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

            log.info("Successfully uploaded knowledge item to Supabase");
        } catch (Exception e) {
            log.error("Upload knowledge failed: {}", e.getMessage(), e);
        }
    }

    // ═══════════════════════════════════════════════════════════
    // EMBEDDING
    // ═══════════════════════════════════════════════════════════

    private List<Double> embedText(String text) {
        Map<String, Object> requestBody = Map.of(
            "model", "models/gemini-embedding-001",
            "outputDimensionality", 768,
            "content", Map.of("parts", new Object[]{ Map.of("text", text) })
        );

        Map<?, ?> result = webClient.post()
                .uri(EMBEDDING_URL + "?key=" + (geminiApiKeySecondary != null && !geminiApiKeySecondary.isBlank()
                        ? geminiApiKeySecondary : geminiApiKey))
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

    // ═══════════════════════════════════════════════════════════
    // SUPABASE VECTOR SEARCH
    // ═══════════════════════════════════════════════════════════

    private List<Map<?, ?>> searchSimilarDocuments(List<Double> queryVector) {
        Map<String, Object> requestBody = Map.of(
            "query_embedding", queryVector,
            "match_threshold", -1.0,  // Always return top N
            "match_count", 15
        );

        List<?> results = webClient.post()
                .uri(supabaseUrl + "/rest/v1/rpc/match_documents")
                .header("apikey", supabaseKey)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + supabaseKey)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(List.class)
                .block();

        if (results == null || results.isEmpty()) return new ArrayList<>();

        return results.stream()
                .map(item -> (Map<?, ?>) item)
                .collect(Collectors.toList());
    }

    // ═══════════════════════════════════════════════════════════
    // EXTRACT PRODUCT RECOMMENDATIONS FROM VECTOR SEARCH RESULTS
    // ═══════════════════════════════════════════════════════════

    private String callGeminiWithMemory(String userMessage, String productCatalog, String ragContext, String sessionId) {
        if (geminiApiKey.startsWith("your-gemini-api-key") || geminiApiKey.isBlank()) {
            return "Xin chào! Tôi là LILI AI Assistant 🌸. Vui lòng cấu hình GEMINI_API_KEY.";
        }

        // ── Build enriched user message ──
        StringBuilder enrichedMessage = new StringBuilder();
        if (productCatalog != null && !productCatalog.isBlank()) {
            enrichedMessage.append(productCatalog).append("\n\n");
        }
        if (ragContext != null && !ragContext.isBlank()) {
            enrichedMessage.append("[CHI TIẾT BỔ SUNG]\n").append(ragContext).append("\n[/CHI TIẾT BỔ SUNG]\n\n");
        }
        String summary = conversationSummaries.get(sessionId);
        if (summary != null && !summary.isBlank()) {
            enrichedMessage.append("[TÓM TẮT CUỘC TRÒ CHUYỆN TRƯỚC ĐÓ]\n")
                    .append(summary).append("\n[/TÓM TẮT]\n\n");
        }
        enrichedMessage.append("Câu hỏi của khách hàng: ").append(userMessage);

        // ── Manage in-memory history ──
        List<Map<String, Object>> history = chatHistory.computeIfAbsent(sessionId, k -> new ArrayList<>());
        Map<String, Object> userEntry = new LinkedHashMap<>();
        userEntry.put("role", "user");
        List<Map<String, Object>> userParts = new ArrayList<>();
        Map<String, Object> userText = new LinkedHashMap<>();
        userText.put("text", enrichedMessage.toString());
        userParts.add(userText);
        userEntry.put("parts", userParts);
        history.add(userEntry);

        if (history.size() > MAX_HISTORY_SIZE) {
            summarizeAndTruncate(sessionId, history);
        }

        try {
            // ── Build request JSON via ObjectMapper (guaranteed correct format) ──
            ObjectNode root = objectMapper.createObjectNode();

            // system_instruction
            ObjectNode sysInstruction = root.putObject("system_instruction");
            ArrayNode sysParts = sysInstruction.putArray("parts");
            sysParts.addObject().put("text", SYSTEM_INSTRUCTION);

            // contents (conversation history)
            ArrayNode contents = root.putArray("contents");
            for (Map<String, Object> entry : history) {
                ObjectNode contentNode = contents.addObject();
                contentNode.put("role", entry.get("role").toString());
                ArrayNode parts = contentNode.putArray("parts");
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> entryParts = (List<Map<String, Object>>) entry.get("parts");
                for (Map<String, Object> part : entryParts) {
                    parts.addObject().put("text", part.get("text").toString());
                }
            }

            // generationConfig
            ObjectNode config = root.putObject("generationConfig");
            config.put("temperature", 0.7);
            config.put("maxOutputTokens", 1200);

            String requestJson = objectMapper.writeValueAsString(root);
            log.debug("[GEMINI] Request JSON (first 300 chars): {}", requestJson.substring(0, Math.min(300, requestJson.length())));

            Map<?, ?> result = callGeminiWithRetry(requestJson);

            if (result != null && result.containsKey("candidates")) {
                var candidates = (List<?>) result.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    var firstCandidate = (Map<?, ?>) candidates.get(0);

                    String finishReason = firstCandidate.get("finishReason") != null
                            ? firstCandidate.get("finishReason").toString() : "";
                    if ("SAFETY".equals(finishReason) || "RECITATION".equals(finishReason)) {
                        log.warn("[GEMINI] Content blocked. finishReason={}", finishReason);
                        return "Mình xin lỗi, mình không thể trả lời câu hỏi này 🙏 Hãy thử hỏi về sản phẩm thời trang nhé!";
                    }

                    var contentMap = (Map<?, ?>) firstCandidate.get("content");
                    if (contentMap != null) {
                        var parts = (List<?>) contentMap.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Object textObj = ((Map<?, ?>) parts.get(0)).get("text");
                            if (textObj != null) {
                                String botReply = textObj.toString();

                                // Save bot reply to in-memory history
                                Map<String, Object> modelEntry = new LinkedHashMap<>();
                                modelEntry.put("role", "model");
                                List<Map<String, Object>> modelParts = new ArrayList<>();
                                Map<String, Object> modelText = new LinkedHashMap<>();
                                modelText.put("text", botReply);
                                modelParts.add(modelText);
                                modelEntry.put("parts", modelParts);
                                history.add(modelEntry);

                                return botReply;
                            }
                        }
                    }
                }
            }
            log.warn("[GEMINI] Unexpected response structure: {}", result);
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            throw new RuntimeException("Gemini unavailable: " + e.getMessage(), e);
        }

        throw new RuntimeException("Gemini returned no valid response.");
    }

    // ── Summarize old messages before truncating ──────────────

    private void summarizeAndTruncate(String sessionId, List<Map<String, Object>> history) {
        // Extract messages that will be removed
        int removeCount = history.size() - KEEP_RECENT_COUNT;
        if (removeCount <= 0) return;

        // Build summary from old messages
        StringBuilder oldContext = new StringBuilder();
        oldContext.append("Tóm tắt các cuộc trò chuyện trước:\n");
        for (int i = 0; i < removeCount; i++) {
            Map<String, Object> msg = history.get(i);
            String role = msg.get("role").toString();
            Object[] parts = (Object[]) msg.get("parts");
            if (parts != null && parts.length > 0) {
                String text = ((Map<?, ?>) parts[0]).get("text").toString();
                // Trim long texts for summary
                if (text.length() > 200) {
                    text = text.substring(0, 200) + "...";
                }
                oldContext.append(role.equals("user") ? "Khách: " : "Bot: ").append(text).append("\n");
            }
        }

        // Merge with existing summary
        String existingSummary = conversationSummaries.getOrDefault(sessionId, "");
        if (!existingSummary.isBlank()) {
            oldContext.insert(0, existingSummary + "\n---\n");
        }
        conversationSummaries.put(sessionId, oldContext.toString());

        // Keep only recent messages
        List<Map<String, Object>> recentHistory = new ArrayList<>(
                history.subList(removeCount, history.size()));
        history.clear();
        history.addAll(recentHistory);
        chatHistory.put(sessionId, history);

        log.debug("Truncated history for session {}: removed {} messages, kept {}",
                sessionId, removeCount, history.size());
    }

    // ─── Gemini API call with retry on 503/429 ───────────────────

    private static final List<String> FALLBACK_MODELS = List.of(
        "gemini-2.0-flash-lite"  // fallback model
    );

    // ─── Resolve active API key: first non-exhausted key in [primary, secondary, tertiary] ─
    private List<String> allApiKeys() {
        List<String> keys = new ArrayList<>();
        keys.add(geminiApiKey);
        if (geminiApiKeySecondary != null && !geminiApiKeySecondary.isBlank()) keys.add(geminiApiKeySecondary);
        if (geminiApiKeyTertiary  != null && !geminiApiKeyTertiary.isBlank())  keys.add(geminiApiKeyTertiary);
        return keys;
    }

    private String resolveApiKey() {
        // Auto-reset all exhaustion flags every 24h
        if (!exhaustedKeys.isEmpty()
                && System.currentTimeMillis() - firstExhaustionAt >= KEY_RESET_INTERVAL_MS) {
            log.info("[GEMINI] 24h elapsed — resetting all key exhaustion flags.");
            exhaustedKeys.clear();
            firstExhaustionAt = 0;
        }
        return allApiKeys().stream()
                .filter(k -> !exhaustedKeys.contains(k))
                .findFirst()
                .orElse(geminiApiKey); // last resort: try primary again
    }

    private void markKeyExhausted(String key) {
        if (exhaustedKeys.add(key) && exhaustedKeys.size() == 1) {
            firstExhaustionAt = System.currentTimeMillis();
        }
        log.error("[GEMINI] Key ...{} exhausted. Total exhausted: {}/{}",
                key.substring(Math.max(0, key.length() - 6)), exhaustedKeys.size(), allApiKeys().size());
    }

    @SuppressWarnings("unchecked")
    private Map<?, ?> callGeminiWithRetry(String requestJson) {
        throttleGeminiCall();

        // ── Try primary model with each non-exhausted key ──
        for (String key : allApiKeys()) {
            if (exhaustedKeys.contains(key)) continue;
            String url = geminiApiUrl + "?key=" + key;
            try {
                log.info("[GEMINI] Calling primary model with key ...{}", key.substring(Math.max(0, key.length() - 6)));
                return webClient.post()
                        .uri(url)
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(requestJson)
                        .retrieve()
                        .onStatus(status -> status.isError(), resp ->
                            resp.bodyToMono(String.class).flatMap(body -> {
                                log.error("[GEMINI] API error {} body: {}", resp.statusCode(), body);
                                return reactor.core.publisher.Mono.error(
                                    new RuntimeException("Gemini error " + resp.statusCode() + "|||" + body));
                            })
                        )
                        .bodyToMono(Map.class)
                        .block();
            } catch (Exception e) {
                String msg = e.getMessage() != null ? e.getMessage() : "";
                boolean is429 = msg.contains("429");
                boolean is503 = msg.contains("503") || msg.contains("UNAVAILABLE");

                if (is429 && msg.contains("limit: 0")) {
                    markKeyExhausted(key); // quota exhausted → try next key
                } else if (is429 || is503) {
                    long wait = extractRetryAfterMs(msg);
                    log.warn("[GEMINI] Rate limited, waiting {}ms before next key...", wait);
                    try { Thread.sleep(Math.min(wait, 5_000)); } catch (InterruptedException ignored) {}
                } else {
                    throw e; // unexpected error, rethrow
                }
            }
        }

        // ── Try fallback models × all keys ──
        log.warn("[GEMINI] All keys failed on primary model, trying fallback models...");
        for (String model : FALLBACK_MODELS) {
            for (String key : allApiKeys()) {
                String fallbackUrl = "https://generativelanguage.googleapis.com/v1beta/models/"
                        + model + ":generateContent?key=" + key;
                try {
                    log.info("[GEMINI] Fallback: model={} key=...{}", model,
                            key.substring(Math.max(0, key.length() - 6)));
                    return webClient.post()
                            .uri(fallbackUrl)
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(requestJson)
                            .retrieve()
                            .onStatus(status -> status.isError(), resp ->
                                resp.bodyToMono(String.class).flatMap(body -> {
                                    log.error("[GEMINI] Fallback {} error {}: {}", model, resp.statusCode(), body);
                                    return reactor.core.publisher.Mono.error(
                                        new RuntimeException("Gemini fallback " + model + " " + resp.statusCode() + "|||" + body));
                                })
                            )
                            .bodyToMono(Map.class)
                            .block();
                } catch (Exception fallbackEx) {
                    String fm = fallbackEx.getMessage() != null ? fallbackEx.getMessage() : "";
                    if (fm.contains("limit: 0")) {
                        log.warn("[GEMINI] Quota exhausted for model={} key=...{}, trying next.", model,
                                key.substring(Math.max(0, key.length() - 6)));
                    } else {
                        log.warn("[GEMINI] Fallback model={} key=...{} failed: {}", model,
                                key.substring(Math.max(0, key.length() - 6)), fm);
                    }
                }
            }
        }

        throw new RuntimeException("All Gemini models and keys unavailable. Please try again later.");
    }

    private long extractRetryAfterMs(String errorMsg) {
        try {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("\"retryDelay\"\\s*:\\s*\"([0-9.]+)s\"").matcher(errorMsg);
            if (m.find()) return (long) (Double.parseDouble(m.group(1)) * 1000) + 500;
        } catch (Exception ignored) {}
        return 10_000;
    }

    // ─── Thread-safe throttle ───────────────────────────────

    private void throttleGeminiCall() {
        geminiLock.lock(); // only ONE thread can be inside at a time
        try {
            long now = System.currentTimeMillis();
            long elapsed = now - lastGeminiCallTime;
            if (elapsed < MIN_CALL_INTERVAL_MS) {
                long waitMs = MIN_CALL_INTERVAL_MS - elapsed;
                log.info("[THROTTLE] Queued request waiting {}ms...", waitMs);
                try { Thread.sleep(waitMs); } catch (InterruptedException ignored) {}
            }
            lastGeminiCallTime = System.currentTimeMillis();
        } finally {
            geminiLock.unlock();
        }
    }
}
