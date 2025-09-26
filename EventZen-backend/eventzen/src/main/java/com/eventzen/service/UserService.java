// ================== UserService.java ==================
package com.eventzen.service;

import java.util.List;

import com.eventzen.dto.request.ProfileUpdateRequest;
import com.eventzen.dto.response.UserResponse;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;

public interface UserService {

    // ===== EXISTING METHODS =====
    UserResponse getUserProfile(Long userId) throws Exception;

    UserResponse updateUserProfile(Long userId, ProfileUpdateRequest request) throws Exception;

    List<UserResponse> getAllUsers();

    UserResponse getUserById(Long userId) throws Exception;

    void deleteUser(Long userId) throws Exception;

    // ===== ADMIN METHODS =====
    List<User> getAllOrganizers();

    List<User> getAllVisitors();

    User getOrganizerById(Long id);

    User getVisitorById(Long id);

    User createOrganizer(User organizer);

    User updateOrganizer(User organizer);

    User toggleOrganizerStatus(Long organizerId);

    void deleteOrganizerAsAdmin(Long organizerId);

    void deleteVisitorAsAdmin(Long visitorId);

    boolean existsByEmail(String email);

    Role getOrganizerRole();

    Role getVisitorRole();

    int getRegisteredEventsCount(Long userId);

    long countOrganizers();

    long countVisitors();
}