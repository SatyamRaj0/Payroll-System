package com.payroll.backend.auth.controller;

import com.payroll.backend.auth.dto.*;
import com.payroll.backend.auth.service.AuthService;
import com.payroll.backend.common.dto.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody AuthRequest request) {
        return ResponseEntity.ok(
            ApiResponse.ok(authService.login(request), "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(
            ApiResponse.ok(authService.refresh(request), "Token refreshed"));
    }
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Missing or invalid Authorization header");
        }
        String token = authHeader.substring(7);
        try {
            String username = authService.getJwtService().extractUsername(token);
            // Optionally, you can check if user exists
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }
}