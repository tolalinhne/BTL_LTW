package com.lilifashion.module.rbac.controller;

import com.lilifashion.common.dto.ApiResponse;
import com.lilifashion.common.exception.AppException;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.auth.repository.UserRepository;
import com.lilifashion.module.rbac.entity.Permission;
import com.lilifashion.module.rbac.entity.Role;
import com.lilifashion.module.rbac.entity.RolePermission;
import com.lilifashion.module.rbac.entity.UserRole;
import com.lilifashion.module.rbac.repository.PermissionRepository;
import com.lilifashion.module.rbac.repository.RoleRepository;
import com.lilifashion.module.rbac.repository.UserRoleRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasAuthority('staff.manage')")
@Tag(name = "RBAC", description = "Quản lý vai trò và phân quyền")
@SecurityRequirement(name = "Bearer")
public class RbacController {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;

    // ─── Permissions ─────────────────────────────────────────────

    @GetMapping("/permissions")
    @Operation(summary = "Danh sách tất cả permissions")
    public ResponseEntity<ApiResponse<List<PermissionDto>>> getPermissions() {
        List<PermissionDto> list = permissionRepository.findAll().stream()
                .map(PermissionDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/permissions")
    @Operation(summary = "Tạo permission mới")
    public ResponseEntity<ApiResponse<PermissionDto>> createPermission(
            @Valid @RequestBody PermissionRequest request) {
        if (permissionRepository.existsByKey(request.getKey())) {
            throw AppException.conflict("Permission key đã tồn tại");
        }
        Permission p = Permission.builder()
                .key(request.getKey())
                .label(request.getLabel())
                .description(request.getDescription())
                .danger(request.isDanger())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(PermissionDto.from(permissionRepository.save(p))));
    }

    @DeleteMapping("/permissions/{id}")
    @Operation(summary = "Xóa permission")
    public ResponseEntity<ApiResponse<Void>> deletePermission(@PathVariable Long id) {
        permissionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── Roles ───────────────────────────────────────────────────

    @GetMapping("/roles")
    @Operation(summary = "Danh sách tất cả roles")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getRoles() {
        return ResponseEntity.ok(ApiResponse.success(
                roleRepository.findAll().stream().map(RoleDto::from).collect(Collectors.toList())));
    }

    @PostMapping("/roles")
    @Operation(summary = "Tạo role mới với danh sách permission keys")
    @Transactional
    public ResponseEntity<ApiResponse<RoleDto>> createRole(
            @Valid @RequestBody RoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw AppException.conflict("Tên role đã tồn tại");
        }

        Role role = Role.builder()
                .name(request.getName())
                .description(request.getDescription())
                .color(request.getColor())
                .system(false)
                .build();

        if (request.getPermissionKeys() != null) {
            List<Permission> permissions = permissionRepository.findByKeyIn(request.getPermissionKeys());
            for (Permission perm : permissions) {
                role.getRolePermissions().add(
                        RolePermission.builder().role(role).permission(perm).build());
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo role thành công", RoleDto.from(roleRepository.save(role))));
    }

    @PutMapping("/roles/{id}")
    @Operation(summary = "Cập nhật role và permissions")
    @Transactional
    public ResponseEntity<ApiResponse<RoleDto>> updateRole(
            @PathVariable Long id, @RequestBody RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Role"));
        if (role.isSystem()) {
            throw AppException.forbidden("Không thể sửa system role");
        }

        if (request.getName() != null) role.setName(request.getName());
        if (request.getDescription() != null) role.setDescription(request.getDescription());
        if (request.getColor() != null) role.setColor(request.getColor());

        if (request.getPermissionKeys() != null) {
            role.getRolePermissions().clear();
            List<Permission> permissions = permissionRepository.findByKeyIn(request.getPermissionKeys());
            for (Permission perm : permissions) {
                role.getRolePermissions().add(
                        RolePermission.builder().role(role).permission(perm).build());
            }
        }

        return ResponseEntity.ok(ApiResponse.success(RoleDto.from(roleRepository.save(role))));
    }

    @DeleteMapping("/roles/{id}")
    @Operation(summary = "Xóa role")
    public ResponseEntity<ApiResponse<Void>> deleteRole(@PathVariable Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> AppException.notFound("Role"));
        if (role.isSystem()) throw AppException.forbidden("Không thể xóa system role");
        roleRepository.delete(role);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── User-Role Assignment ─────────────────────────────────────

    @PostMapping("/users/{userId}/roles")
    @Operation(summary = "Gán role cho user")
    @Transactional
    public ResponseEntity<ApiResponse<String>> assignRole(
            @PathVariable Long userId, @RequestBody AssignRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> AppException.notFound("User"));
        Role role = roleRepository.findById(request.getRoleId())
                .orElseThrow(() -> AppException.notFound("Role"));

        if (userRoleRepository.existsByUserIdAndRoleId(userId, request.getRoleId())) {
            throw AppException.conflict("User đã có role này");
        }

        userRoleRepository.save(UserRole.builder().user(user).role(role).build());
        return ResponseEntity.ok(ApiResponse.success("Gán role thành công"));
    }

    @DeleteMapping("/users/{userId}/roles/{roleId}")
    @Operation(summary = "Thu hồi role của user")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> revokeRole(
            @PathVariable Long userId, @PathVariable Long roleId) {
        userRoleRepository.deleteByUserIdAndRoleId(userId, roleId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // ─── Inner DTOs ─────────────────────────────────────────

    @Data public static class PermissionRequest {
        @NotBlank private String key;
        @NotBlank private String label;
        private String description;
        private boolean danger = false;
    }

    @Data public static class RoleRequest {
        @NotBlank private String name;
        private String description;
        private String color;
        private List<String> permissionKeys;
    }

    @Data public static class AssignRoleRequest {
        private Long roleId;
    }

    @Data public static class PermissionDto {
        private Long id; private String key; private String label;
        private String description; private boolean danger;
        static PermissionDto from(Permission p) {
            PermissionDto d = new PermissionDto();
            d.id = p.getId(); d.key = p.getKey(); d.label = p.getLabel();
            d.description = p.getDescription(); d.danger = p.isDanger(); return d;
        }
    }

    @Data public static class RoleDto {
        private Long id; private String name; private String description;
        private String color; private boolean system; private List<String> permissions;
        static RoleDto from(Role r) {
            RoleDto d = new RoleDto();
            d.id = r.getId(); d.name = r.getName(); d.description = r.getDescription();
            d.color = r.getColor(); d.system = r.isSystem();
            d.permissions = r.getRolePermissions().stream()
                    .map(rp -> rp.getPermission().getKey()).collect(Collectors.toList());
            return d;
        }
    }
}
