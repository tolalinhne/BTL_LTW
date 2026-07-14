package com.lilifashion.module.ai.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.module.ai.service.ProductSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/ai")
@Tag(name = "AI Knowledge Sync", description = "Đồng bộ dữ liệu sản phẩm cho AI Chatbot")
public class ProductSyncController {

    private final ProductSyncService productSyncService;

    @PostMapping("/sync-products")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
        summary = "Đồng bộ toàn bộ sản phẩm vào Vector DB cho chatbot",
        description = "Quét tất cả sản phẩm ACTIVE và tạo embedding vectors trong Supabase. " +
                      "Quá trình này có thể mất vài phút tùy số lượng sản phẩm.",
        security = @SecurityRequirement(name = "Bearer")
    )
    public ResponseEntity<ApiResponse<String>> syncAllProducts() {
        int count = productSyncService.syncAllProducts();
        return ResponseEntity.ok(ApiResponse.success(
                "Đã đồng bộ thành công " + count + " sản phẩm vào AI knowledge base."));
    }
}
