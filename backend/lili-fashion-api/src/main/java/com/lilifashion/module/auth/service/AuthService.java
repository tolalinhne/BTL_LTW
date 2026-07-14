package com.lilifashion.module.auth.service;

import com.lilifashion.common.exception.AppException;
import com.lilifashion.config.JwtService;
import com.lilifashion.module.auth.dto.AuthRequest;
import com.lilifashion.module.auth.dto.AuthResponse;
import com.lilifashion.module.auth.entity.User;
import com.lilifashion.module.auth.entity.User.UserRole_Enum;
import com.lilifashion.module.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse.TokenPair register(AuthRequest.Register request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw AppException.conflict("Email đã được sử dụng");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(UserRole_Enum.MEMBER)
                .active(true)
                .build();

        userRepository.save(user);
        return buildTokenPair(user);
    }

    public AuthResponse.TokenPair login(AuthRequest.Login request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
        } catch (BadCredentialsException e) {
            throw AppException.unauthorized("Sai email hoặc mật khẩu");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> AppException.notFound("User"));

        if (!user.isActive()) {
            throw AppException.forbidden("Tài khoản đã bị khóa");
        }

        return buildTokenPair(user);
    }

    public AuthResponse.TokenPair refreshToken(String refreshToken) {
        String email = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> AppException.unauthorized("Token không hợp lệ"));

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw AppException.unauthorized("Refresh token đã hết hạn");
        }

        return buildTokenPair(user);
    }

    @Transactional
    public void changePassword(User currentUser, AuthRequest.ChangePassword request) {
        if (!passwordEncoder.matches(request.getOldPassword(), currentUser.getPassword())) {
            throw AppException.badRequest("Mật khẩu cũ không đúng");
        }
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
    }

    @Transactional
    public void saveUser(User user) {
        userRepository.save(user);
    }

    private AuthResponse.TokenPair buildTokenPair(User user) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        AuthResponse.UserInfo userInfo = AuthResponse.UserInfo.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatar(user.getAvatar())
                .role(user.getRole().name().toLowerCase())
                .build();

        return AuthResponse.TokenPair.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(userInfo)
                .build();
    }
}
