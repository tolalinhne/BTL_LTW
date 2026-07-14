package com.lilifashion.module.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthRequest {

    @Data
    public static class Register {
        @NotBlank(message = "Tên không được để trống")
        private String name;

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu phải ít nhất 6 ký tự")
        private String password;

        private String phone;
    }

    @Data
    public static class Login {
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không hợp lệ")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        private String password;
    }

    @Data
    public static class RefreshToken {
        @NotBlank(message = "Refresh token không được để trống")
        private String refreshToken;
    }

    @Data
    public static class ChangePassword {
        @NotBlank
        private String oldPassword;

        @NotBlank
        @Size(min = 6, message = "Mật khẩu mới phải ít nhất 6 ký tự")
        private String newPassword;
    }
}
