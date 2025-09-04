package com.eventzen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.LoginRequest;
import com.eventzen.dto.request.RegisterRequest;
import com.eventzen.dto.response.AuthResponse;
import com.eventzen.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        System.out.println("🔍 REGISTER REQUEST RECEIVED for email: " + request.getEmail());
        try {
            AuthResponse response = authService.register(request);
            System.out.println("✅ REGISTRATION SUCCESS - Token generated: " + (response.getToken() != null));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ REGISTRATION FAILED: " + e.getMessage());
            e.printStackTrace();
            AuthResponse errorResponse = new AuthResponse(
                    null,
                    request.getEmail(),
                    null,
                    "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        System.out.println("🔍 LOGIN REQUEST RECEIVED for email: " + request.getEmail());
        try {
            AuthResponse response = authService.login(request);
            System.out.println("✅ LOGIN SUCCESS - Token: "
                    + (response.getToken() != null ? response.getToken().substring(0, 20) + "..." : "NULL"));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("❌ LOGIN FAILED: " + e.getMessage());
            e.printStackTrace();
            AuthResponse errorResponse = new AuthResponse(
                    null,
                    request.getEmail(),
                    null,
                    "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }
}