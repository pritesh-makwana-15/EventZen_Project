package com.eventzen.service;

import java.util.List;

import com.eventzen.dto.request.ProfileUpdateRequest;
import com.eventzen.dto.response.UserResponse;

public interface UserService {

    // User profile operations
    UserResponse getUserProfile(Long userId) throws Exception;

    UserResponse updateUserProfile(Long userId, ProfileUpdateRequest request) throws Exception;

    // Admin operations
    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long userId) throws Exception;

    void deleteUser(Long userId) throws Exception;
}
