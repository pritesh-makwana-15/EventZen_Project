package com.eventzen.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.CreateOrganizerRequest;
import com.eventzen.dto.request.ProfileUpdateRequest;
import com.eventzen.dto.request.UpdatePasswordRequest; // 🆕 ADDED
import com.eventzen.dto.response.EventResponse;
import com.eventzen.dto.response.UserResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.EventService;
import com.eventzen.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private EventService eventService;

    @Autowired
    private UserService userService;

    @Autowired
    private EventService eventService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private EventRepository eventRepository;

    // ==================== USERS MANAGEMENT ====================

    /**
     * Get all users (Admin only)
     */
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Get users by role (Organizers, Visitors, etc.)
     */
    @GetMapping("/users/role/{role}")
    public ResponseEntity<List<UserResponse>> getUsersByRole(@PathVariable String role) {
        List<UserResponse> users = userService.getAllUsers().stream()
                .filter(u -> u.getRole().equalsIgnoreCase(role))
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    /**
     * Get all organizers
     */
    @GetMapping("/organizers")
    public ResponseEntity<List<UserResponse>> getAllOrganizers() {
        List<UserResponse> organizers = userService.getAllUsers().stream()
                .filter(u -> "ORGANIZER".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(organizers);
    }

    /**
     * Get all visitors
     */
    @GetMapping("/visitors")
    public ResponseEntity<List<UserResponse>> getAllVisitors() {
        List<UserResponse> visitors = userService.getAllUsers().stream()
                .filter(u -> "VISITOR".equalsIgnoreCase(u.getRole()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitors);
    }

    /**
     * Get user by ID
     */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        try {
            UserResponse user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Update user details (Admin can update any user)
     */
    @PutMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody ProfileUpdateRequest request) {
        try {
            UserResponse updatedUser = userService.updateUserProfile(id, request);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * Delete user (Admin only)
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ==================== ORGANIZER CREATION ====================

    /**
     * Create new organizer account (Admin only)
     */
    @PostMapping("/organizers/create")
    public ResponseEntity<?> createOrganizer(@Valid @RequestBody CreateOrganizerRequest request) {
        try {
            // Check if email already exists
            if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body("Email already exists");
            }

            // Create new organizer user
            User organizer = new User();
            organizer.setName(request.getName());
            organizer.setEmail(request.getEmail());
            organizer.setPassword(passwordEncoder.encode(request.getPassword()));
            organizer.setRole(Role.ORGANIZER);

            User savedOrganizer = userRepository.save(organizer);

            UserResponse response = new UserResponse(
                    savedOrganizer.getId(),
                    savedOrganizer.getName(),
                    savedOrganizer.getEmail(),
                    savedOrganizer.getRole().name());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error creating organizer: " + e.getMessage());
        }
    }

    // ==================== EVENTS MANAGEMENT ====================

    /**
     * Get all events (Admin can see all events)
     */
    @GetMapping("/events")
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        List<EventResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * Get event by ID
     */
    @GetMapping("/events/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable Long id) {
        try {
            EventResponse event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Delete event (Admin can delete any event - bypasses organizer check)
     */
    @DeleteMapping("/events/{id}")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            // Admin can delete any event, so we directly delete from repository
            Event event = eventRepository.findById(id)
                    .orElseThrow(() -> new Exception("Event not found"));

            eventRepository.delete(event);
            return ResponseEntity.ok("Event deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // ==================== ADMIN PROFILE ====================

    /**
     * Get current admin profile
     * 🔧 UPDATED: Now returns mobileNumber and imageUrl
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile() {
        try {
            System.out.println("📋 Fetching admin profile");

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("Admin not found"));

            // 🆕 UPDATED: Use new constructor with all fields
            UserResponse response = new UserResponse(
                    admin.getId(),
                    admin.getName(),
                    admin.getEmail(),
                    admin.getRole().name(),
                    admin.getMobileNumber(),
                    admin.getImageUrl());

            System.out.println("✅ Admin profile fetched: " + admin.getName());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error fetching admin profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Update admin profile (WITHOUT password)
     * 🔧 UPDATED: Now handles mobileNumber and imageUrl
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody ProfileUpdateRequest request) {
        try {
            System.out.println("🔄 Updating admin profile");

            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("Admin not found"));

            // Update allowed fields (NOT password, NOT email, NOT role)
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                admin.setName(request.getName().trim());
                System.out.println("📝 Updated name: " + request.getName());
            }

            if (request.getMobileNumber() != null) {
                admin.setMobileNumber(request.getMobileNumber().trim());
                System.out.println("📞 Updated mobile: " + request.getMobileNumber());
            }

            if (request.getImageUrl() != null) {
                String imageUrl = request.getImageUrl();
                if (imageUrl.length() > 1000) {
                    System.out.println("⚠️ Image URL too long, skipping update");
                } else {
                    admin.setImageUrl(imageUrl);
                    System.out.println("🖼️ Updated profile image");
                }
            }

            User updatedAdmin = userRepository.save(admin);

            // 🆕 UPDATED: Return response with all fields
            UserResponse response = new UserResponse(
                    updatedAdmin.getId(),
                    updatedAdmin.getName(),
                    updatedAdmin.getEmail(),
                    updatedAdmin.getRole().name(),
                    updatedAdmin.getMobileNumber(),
                    updatedAdmin.getImageUrl());

            System.out.println("✅ Admin profile updated successfully");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("❌ Error updating admin profile: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    /**
     * 🆕 NEW: Update admin password separately
     * This is the KEY method that was missing!
     */
    @PutMapping("/password")
    public ResponseEntity<?> updateAdminPassword(@RequestBody UpdatePasswordRequest request) {
        try {
            System.out.println("🔐 Admin password change request received");

            // Validate request
            if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
                System.out.println("❌ Current password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Current password is required");
            }

            if (request.getNewPassword() == null || request.getNewPassword().trim().isEmpty()) {
                System.out.println("❌ New password is required");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("New password is required");
            }

            if (request.getNewPassword().length() < 6) {
                System.out.println("❌ New password must be at least 6 characters");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("New password must be at least 6 characters");
            }

            // Get current admin from JWT
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("Admin not found"));

            System.out.println("👤 Admin found: " + admin.getName() + " (ID: " + admin.getId() + ")");

            // 🔒 CRITICAL: Verify current password
            if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
                System.out.println("❌ Current password does not match");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Current password is incorrect");
            }

            System.out.println("✅ Current password verified");

            // Update password with encryption
            admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(admin);

            System.out.println("✅ Password updated successfully for admin: " + email);
            return ResponseEntity.ok("Password updated successfully");

        } catch (Exception e) {
            System.err.println("❌ Error updating admin password: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to update password: " + e.getMessage());
        }
    }

    // ==================== STATISTICS ====================

    /**
     * Get dashboard statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        try {
            List<UserResponse> allUsers = userService.getAllUsers();
            List<EventResponse> allEvents = eventService.getAllEvents();

            long totalOrganizers = allUsers.stream()
                    .filter(u -> "ORGANIZER".equalsIgnoreCase(u.getRole()))
                    .count();

            long totalVisitors = allUsers.stream()
                    .filter(u -> "VISITOR".equalsIgnoreCase(u.getRole()))
                    .count();

            long totalEvents = allEvents.size();
            long activeEvents = allEvents.stream()
                    .filter(e -> e.getIsActive() != null && e.getIsActive())
                    .count();

            return ResponseEntity.ok(new DashboardStats(
                    totalOrganizers,
                    totalVisitors,
                    totalEvents,
                    activeEvents));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching statistics");
        }
    }

    // Inner class for statistics response
    public static class DashboardStats {
        private long totalOrganizers;
        private long totalVisitors;
        private long totalEvents;
        private long activeEvents;

        public DashboardStats(long totalOrganizers, long totalVisitors, long totalEvents, long activeEvents) {
            this.totalOrganizers = totalOrganizers;
            this.totalVisitors = totalVisitors;
            this.totalEvents = totalEvents;
            this.activeEvents = activeEvents;
        }

        // Getters
        public long getTotalOrganizers() {
            return totalOrganizers;
        }

        public long getTotalVisitors() {
            return totalVisitors;
        }

        public long getTotalEvents() {
            return totalEvents;
        }

        public long getActiveEvents() {
            return activeEvents;
        }
    }
}