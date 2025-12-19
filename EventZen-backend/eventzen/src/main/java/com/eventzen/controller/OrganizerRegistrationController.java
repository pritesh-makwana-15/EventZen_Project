// ================================================================
// FILE 1: OrganizerRegistrationController.java
// Location: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\controller\
// ================================================================
package com.eventzen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.eventzen.dto.response.RegistrationResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;

@RestController
@RequestMapping("/api/organizer")
@PreAuthorize("hasRole('ORGANIZER')")
public class OrganizerRegistrationController {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get all registrations for a specific event
     * Only accessible by the event owner
     * 
     * @param eventId Event ID
     * @param page Page number (default 0)
     * @param size Page size (default 10)
     * @return Paginated list of registrations
     */
    @GetMapping("/events/{eventId}/registrations")
    public ResponseEntity<?> getEventRegistrations(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            // Get current organizer
            Long currentOrganizerId = getCurrentUserId();

            // Verify event ownership
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new Exception("Event not found"));

            if (!event.getOrganizerId().equals(currentOrganizerId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "You can only view registrations for your own events"));
            }

            // Get paginated registrations
            Pageable pageable = PageRequest.of(page, size);
            Page<Registration> registrationsPage = registrationRepository.findByEventIdOrderByRegisteredAtDesc(
                    eventId, pageable);

            // Convert to response DTOs
            List<RegistrationResponse> registrations = registrationsPage.getContent().stream()
                    .map(this::convertToResponse)
                    .toList();

            Map<String, Object> response = Map.of(
                    "registrations", registrations,
                    "currentPage", registrationsPage.getNumber(),
                    "totalItems", registrationsPage.getTotalElements(),
                    "totalPages", registrationsPage.getTotalPages(),
                    "eventTitle", event.getTitle(),
                    "eventDate", event.getStartDate().toString());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get registration statistics for an event
     */
    @GetMapping("/events/{eventId}/registrations/stats")
    public ResponseEntity<?> getRegistrationStats(@PathVariable Long eventId) {
        try {
            Long currentOrganizerId = getCurrentUserId();

            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new Exception("Event not found"));

            if (!event.getOrganizerId().equals(currentOrganizerId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("error", "Access denied"));
            }

            long totalRegistrations = registrationRepository.countByEventId(eventId);
            long confirmedCount = registrationRepository.countByEventIdAndStatus(
                    eventId, com.eventzen.entity.RegistrationStatus.CONFIRMED);
            long cancelledCount = registrationRepository.countByEventIdAndStatus(
                    eventId, com.eventzen.entity.RegistrationStatus.CANCELLED);

            Map<String, Object> stats = Map.of(
                    "totalRegistrations", totalRegistrations,
                    "confirmed", confirmedCount,
                    "cancelled", cancelledCount,
                    "maxCapacity", event.getMaxAttendees() != null ? event.getMaxAttendees() : 0);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Helper methods
    private Long getCurrentUserId() throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new Exception("User not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        return user.getId();
    }

    private RegistrationResponse convertToResponse(Registration registration) {
        RegistrationResponse response = new RegistrationResponse();
        response.setId(registration.getId());
        response.setEventId(registration.getEvent().getId());
        response.setVisitorId(registration.getVisitor().getId());
        response.setVisitorName(registration.getVisitor().getName());
        response.setVisitorEmail(registration.getVisitor().getEmail());
        response.setPhone(registration.getPhone());
        response.setStatus(registration.getStatus());
        response.setRegisteredAt(registration.getRegisteredAt());
        response.setNotes(registration.getNotes());
        return response;
    }
}