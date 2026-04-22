

package com.payroll.backend.auth.service;

import com.payroll.backend.auth.JwtService;
import com.payroll.backend.auth.dto.*;
import com.payroll.backend.auth.model.*;
import com.payroll.backend.auth.repository.*;
import com.payroll.backend.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {
    public JwtService getJwtService() {
        return jwtService;
    }

    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    @SuppressWarnings("null")
    @Transactional
    public AuthResponse login(AuthRequest request) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(),
                request.getPassword()
            )
        );

        User user = userRepo.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException(
                "User not found: " + request.getEmail()));

        refreshTokenRepo.revokeAllByUserId(user.getId());

        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenStr = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenRepo.save(RefreshToken.builder()
            .token(refreshTokenStr)
            .user(user)
            .expiresAt(Instant.now().plusMillis(604800000))
            .revoked(false)
            .build());

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshTokenStr)
            .role(user.getRole().name())
            .email(user.getEmail())
            .build();
    }

    @SuppressWarnings("null")
    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken stored = refreshTokenRepo
            .findByToken(request.getRefreshToken())
            .orElseThrow(() -> new ResourceNotFoundException(
                "Refresh token not found"));

        if (stored.isRevoked())
            throw new RuntimeException("Refresh token has been revoked");

        if (stored.getExpiresAt().isBefore(Instant.now()))
            throw new RuntimeException("Refresh token has expired");

        User user = stored.getUser();

        stored.setRevoked(true);
        refreshTokenRepo.save(stored);

        String newAccess = jwtService.generateAccessToken(user);
        String newRefresh = jwtService.generateRefreshToken(user.getEmail());

        refreshTokenRepo.save(RefreshToken.builder()
            .token(newRefresh)
            .user(user)
            .expiresAt(Instant.now().plusMillis(604800000))
            .revoked(false)
            .build());

        return AuthResponse.builder()
            .accessToken(newAccess)
            .refreshToken(newRefresh)
            .role(user.getRole().name())
            .email(user.getEmail())
            .build();
    }
}