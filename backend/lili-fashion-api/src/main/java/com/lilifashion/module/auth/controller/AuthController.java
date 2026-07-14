package com.lilifashion.module.auth.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.module.auth.dto.AuthRequest;
import com.lilifashion.module.auth.dto.AuthResponse;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.auth.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Đăng ký, Đăng nhập, Refresh Token")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Đăng ký tài khoản mới")
    public ResponseEntity<ApiResponse<AuthResponse.TokenPair>> register(
            @Valid @RequestBody AuthRequest.Register request) {
        AuthResponse.TokenPair result = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", result));
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập")
    public ResponseEntity<ApiResponse<AuthResponse.TokenPair>> login(
            @Valid @RequestBody AuthRequest.Login request) {
        AuthResponse.TokenPair result = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", result));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Làm mới access token")
    public ResponseEntity<ApiResponse<AuthResponse.TokenPair>> refresh(
            @Valid @RequestBody AuthRequest.RefreshToken request) {
        AuthResponse.TokenPair result = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping("/change-password")
    @Operation(summary = "Đổi mật khẩu (cần đăng nhập)")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody AuthRequest.ChangePassword request) {
        authService.changePassword(currentUser, request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @GetMapping("/debug")
    @Operation(summary = "Debug: kiểm tra authentication hiện tại")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> debugAuth(
            @AuthenticationPrincipal User currentUser) {
        java.util.Map<String, Object> info = new java.util.LinkedHashMap<>();
        if (currentUser != null) {
            info.put("authenticated", true);
            info.put("email", currentUser.getEmail());
            info.put("role", currentUser.getRole().name());
            info.put("authorities", currentUser.getAuthorities().stream()
                    .map(a -> a.getAuthority()).collect(java.util.stream.Collectors.toList()));
            info.put("active", currentUser.isActive());
        } else {
            info.put("authenticated", false);
            info.put("message", "No user in SecurityContext");
        }
        return ResponseEntity.ok(ApiResponse.success(info));
    }

    @GetMapping("/profile")
    @Operation(summary = "Xem thông tin cá nhân (cần đăng nhập)", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> getProfile(
            @AuthenticationPrincipal User currentUser) {
        AuthResponse.UserInfo info = AuthResponse.UserInfo.builder()
                .id(currentUser.getId())
                .name(currentUser.getName())
                .email(currentUser.getEmail())
                .phone(currentUser.getPhone())
                .avatar(currentUser.getAvatar())
                .role(currentUser.getRole().name().toLowerCase())
                .build();
        return ResponseEntity.ok(ApiResponse.success(info));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật thông tin cá nhân (cần đăng nhập)", security = @SecurityRequirement(name = "Bearer"))
    public ResponseEntity<ApiResponse<AuthResponse.UserInfo>> updateProfile(
            @AuthenticationPrincipal User currentUser,
            @RequestBody ProfileUpdateRequest request) {
        if (request.getName() != null) currentUser.setName(request.getName());
        if (request.getPhone() != null) currentUser.setPhone(request.getPhone());
        if (request.getAvatar() != null) currentUser.setAvatar(request.getAvatar());
        authService.saveUser(currentUser);

        AuthResponse.UserInfo info = AuthResponse.UserInfo.builder()
                .id(currentUser.getId())
                .name(currentUser.getName())
                .email(currentUser.getEmail())
                .phone(currentUser.getPhone())
                .avatar(currentUser.getAvatar())
                .role(currentUser.getRole().name().toLowerCase())
                .build();
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", info));
    }

    @Data
    public static class ProfileUpdateRequest {
        private String name;
        private String phone;
        private String avatar;
    }
}
