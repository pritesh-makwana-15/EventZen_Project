package com.eventzen.service;

import com.eventzen.dto.request.LoginRequest;
import com.eventzen.dto.request.RegisterRequest;
import com.eventzen.dto.response.AuthResponse;

public interface AuthService {

    AuthResponse register(RegisterRequest request) throws Exception;

    AuthResponse login(LoginRequest request) throws Exception;
}