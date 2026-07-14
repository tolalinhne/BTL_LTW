package com.lilifashion.module.user.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.auth.repository.UserRepository;
import com.lilifashion.module.user.entity.Address;
import com.lilifashion.module.user.repository.AddressRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "User Profile", description = "Hồ sơ người dùng và địa chỉ")
@SecurityRequirement(name = "Bearer")
public class UserController {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;

    @GetMapping("/profile")
    @Operation(summary = "Lấy profile người dùng hiện tại")
    public ResponseEntity<ApiResponse<ProfileDto>> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ApiResponse.success(ProfileDto.from(user)));
    }

    @PutMapping("/profile")
    @Operation(summary = "Cập nhật profile")
    @Transactional
    public ResponseEntity<ApiResponse<ProfileDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", ProfileDto.from(user)));
    }

    // ─── Address Book ─────────────────────────────────────────────

    @GetMapping("/addresses")
    @Operation(summary = "Danh sách địa chỉ của tôi")
    public ResponseEntity<ApiResponse<List<AddressDto>>> getAddresses(
            @AuthenticationPrincipal User user) {
        List<AddressDto> addresses = addressRepository.findByUserIdOrderByDefaultAddressDesc(user.getId())
                .stream().map(AddressDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(addresses));
    }

    @PostMapping("/addresses")
    @Operation(summary = "Thêm địa chỉ mới")
    @Transactional
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @AuthenticationPrincipal User user,
            @RequestBody AddressRequest request) {
        Address address = Address.builder()
                .user(user)
                .name(request.getName())
                .phone(request.getPhone())
                .address(request.getAddress())
                .defaultAddress(request.isDefault())
                .build();

        if (request.isDefault()) {
            addressRepository.clearDefault(user.getId());
        }

        return ResponseEntity.ok(ApiResponse.success("Đã thêm địa chỉ",
                AddressDto.from(addressRepository.save(address))));
    }

    @DeleteMapping("/addresses/{id}")
    @Operation(summary = "Xóa địa chỉ")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Địa chỉ"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw AppException.forbidden("Không có quyền xóa địa chỉ này");
        }
        addressRepository.delete(address);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── Admin: User management ────────────────────────────────────

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('staff.manage')")
    @Operation(summary = "Admin: Danh sách người dùng")
    public ResponseEntity<ApiResponse<List<ProfileDto>>> getAllUsers() {
        List<ProfileDto> users = userRepository.findAll().stream()
                .map(ProfileDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PutMapping("/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Khoá/mở khoá tài khoản")
    @Transactional
    public ResponseEntity<ApiResponse<String>> toggleUserStatus(@PathVariable Long id) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("User"));
        target.setActive(!target.isActive());
        userRepository.save(target);
        return ResponseEntity.ok(ApiResponse.success(target.isActive() ? "Đã mở khoá" : "Đã khoá tài khoản"));
    }

    // ─── Inner DTOs ─────────────────────────────────────────

    @Data public static class ProfileDto {
        private Long id; private String name; private String email;
        private String phone; private String avatar; private String role;
        static ProfileDto from(User u) {
            ProfileDto d = new ProfileDto();
            d.id = u.getId(); d.name = u.getName(); d.email = u.getEmail();
            d.phone = u.getPhone(); d.avatar = u.getAvatar();
            d.role = u.getRole().name().toLowerCase(); return d;
        }
    }
    @Data public static class UpdateProfileRequest {
        private String name; private String phone; private String avatar;
    }
    @Data public static class AddressRequest {
        private String name; private String phone; private String address; private boolean isDefault;
    }
    @Data public static class AddressDto {
        private Long id; private String name; private String phone;
        private String address; private boolean isDefault;
        static AddressDto from(Address a) {
            AddressDto d = new AddressDto();
            d.id = a.getId(); d.name = a.getName(); d.phone = a.getPhone();
            d.address = a.getAddress(); d.isDefault = a.isDefaultAddress(); return d;
        }
    }
}
