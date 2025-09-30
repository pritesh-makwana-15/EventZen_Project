package com.eventzen.controller;

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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.CreateOrganizerRequest;
import com.eventzen.dto.request.ProfileUpdateRequest;
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
public class AdminController {

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
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getAdminProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("Admin not found"));

            UserResponse response = new UserResponse(
                    admin.getId(),
                    admin.getName(),
                    admin.getEmail(),
                    admin.getRole().name());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Update admin profile
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateAdminProfile(@RequestBody ProfileUpdateRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String email = authentication.getName();

            User admin = userRepository.findByEmail(email)
                    .orElseThrow(() -> new Exception("Admin not found"));

            UserResponse updatedAdmin = userService.updateUserProfile(admin.getId(), request);
            return ResponseEntity.ok(updatedAdmin);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
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