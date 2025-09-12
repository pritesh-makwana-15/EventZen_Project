package com.eventzen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.UpdateProfileRequest;
import com.eventzen.dto.response.UserProfileResponse;
import com.eventzen.entity.User;
import com.eventzen.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    /**
     * Get current user's profile (for organizer dashboard)
     */
    @GetMapping("/profile")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'VISITOR', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> getCurrentUserProfile() {
        try {
            System.out.println("Fetching current user profile");

            // Get current user from JWT
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("User not found"));

            UserProfileResponse profile = new UserProfileResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name(), // Convert enum to String
                    user.getMobileNumber(),
                    user.getImageUrl());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            System.out.println("Error fetching user profile: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update current user's profile
     */
    @PutMapping("/profile")
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'VISITOR', 'ADMIN')")
    public ResponseEntity<UserProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            System.out.println("Updating user profile");

            // Get current user from JWT
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("User not found"));

            // Update allowed fields (don't allow email or role change)
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                user.setName(request.getName().trim());
            }

            if (request.getMobileNumber() != null) {
                user.setMobileNumber(request.getMobileNumber().trim());
            }

            if (request.getProfileImage() != null) {
                // Handle image URL safely - same logic as registration
                String imageUrl = request.getProfileImage();
                if (imageUrl.length() > 1000) {
                    System.out.println("⚠️ Image URL too long, skipping update");
                } else {
                    user.setImageUrl(imageUrl);
                }
            }

            User updatedUser = userRepository.save(user);

            UserProfileResponse profile = new UserProfileResponse(
                    updatedUser.getId(),
                    updatedUser.getName(),
                    updatedUser.getEmail(),
                    updatedUser.getRole().name(), // Convert enum to String
                    updatedUser.getMobileNumber(),
                    updatedUser.getImageUrl());

            System.out.println("Profile updated successfully");
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            System.out.println("Error updating profile: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}