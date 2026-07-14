package com.lilifashion.module.upload;

import com.lilifashion.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "Image upload via Cloudinary")
@SecurityRequirement(name = "Bearer")
public class ImageUploadController {

    private final ImageUploadService uploadService;

    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image to Cloudinary")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File không được để trống"));
        }

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Chỉ chấp nhận file ảnh"));
        }

        Map<String, String> result = uploadService.uploadImage(file, folder);
        return ResponseEntity.ok(ApiResponse.success("Upload thành công", result));
    }

    @DeleteMapping("/image")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Operation(summary = "Delete image from Cloudinary (admin/staff only)")
    public ResponseEntity<ApiResponse<Void>> deleteImage(
            @RequestParam("publicId") String publicId) throws IOException {
        uploadService.deleteImage(publicId);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa ảnh", null));
    }
}
