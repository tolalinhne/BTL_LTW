package com.lilifashion.module.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

public class AuthResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TokenPair {
        private String accessToken;
        private String refreshToken;
        private UserInfo user;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private String avatar;
        private String role;
    }
}
