package com.lilifashion.module.sale.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.module.sale.dto.SaleDto;
import com.lilifashion.module.sale.dto.SaleRequest;
import com.lilifashion.module.sale.service.SaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Sale", description = "Quản lý chương trình giảm giá")
public class SaleController {

    private final SaleService saleService;

    // ─── Public ─────────────────────────────────────────────

    @GetMapping("/api/sales/active")
    @Operation(summary = "Lấy danh sách sale đang diễn ra (public)")
    public ResponseEntity<ApiResponse<List<SaleDto>>> getActiveSales() {
        return ResponseEntity.ok(ApiResponse.success(saleService.getActiveSales()));
    }

    // ─── Admin ───────────────────────────────────────────────

    @GetMapping("/api/admin/sales")
    @Operation(summary = "Admin: Danh sách tất cả sale", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<List<SaleDto>>> getAllSales() {
        return ResponseEntity.ok(ApiResponse.success(saleService.getAll()));
    }

    @GetMapping("/api/admin/sales/{id}")
    @Operation(summary = "Admin: Chi tiết sale", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<SaleDto>> getSale(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(saleService.getById(id)));
    }

    @PostMapping("/api/admin/sales")
    @Operation(summary = "Admin: Tạo sale mới", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<SaleDto>> createSale(@RequestBody SaleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo sale thành công", saleService.create(request)));
    }

    @PutMapping("/api/admin/sales/{id}")
    @Operation(summary = "Admin: Cập nhật sale", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<SaleDto>> updateSale(
            @PathVariable Long id, @RequestBody SaleRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", saleService.update(id, request)));
    }

    @DeleteMapping("/api/admin/sales/{id}")
    @Operation(summary = "Admin: Xóa sale", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<Void>> deleteSale(@PathVariable Long id) {
        saleService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa sale thành công", null));
    }
}
