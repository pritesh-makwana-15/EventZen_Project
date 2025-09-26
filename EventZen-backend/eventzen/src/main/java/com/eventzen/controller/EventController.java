package com.eventzen.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.response.EventResponse;
import com.eventzen.service.EventService;
import com.eventzen.service.impl.EventServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventServiceImpl eventServiceImpl;

    // ===== PUBLIC ENDPOINTS =====

    /**
     * Get all public events (for visitors)
     */
    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        System.out.println("Fetching all public events");
        List<EventResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

    /**
     * Get single event by ID (public)
     */
    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEvent(@PathVariable Long id) {
        try {
            EventResponse event = eventService.getEventById(id);
            return ResponseEntity.ok(event);
        } catch (Exception e) {
            System.out.println("Error fetching event: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get events by specific organizer (public)
     */
    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventResponse>> getEventsByOrganizer(@PathVariable Long organizerId) {
        System.out.println("Fetching events for organizer ID: " + organizerId);
        List<EventResponse> events = eventService.getEventsByOrganizer(organizerId);
        return ResponseEntity.ok(events);
    }

    /**
     * Get current organizer's events (for dashboard)
     */
    @GetMapping("/my-events")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<List<EventResponse>> getMyEvents() {
        try {
            System.out.println("Fetching events for current organizer");
            List<EventResponse> myEvents = eventServiceImpl.getMyEvents();
            return ResponseEntity.ok(myEvents);
        } catch (Exception e) {
            System.out.println("Error fetching organizer events: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== ORGANIZER CRUD ENDPOINTS =====

    /**
     * Create new event (ORGANIZER only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventRequest request, BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = eventServiceImpl.processValidationErrors(bindingResult);
                return ResponseEntity.badRequest().body(errors);
            }

            // Fixed: Use LocalDateTime instead of LocalDate for comparison
            if (request.getDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("date", "Date must be in the future"));
            }

            if ("PRIVATE".equalsIgnoreCase(request.getEventType()) &&
                    (request.getPrivateCode() == null || request.getPrivateCode().trim().isEmpty())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("privateCode", "Private code is required for private events"));
            }

            System.out.println("Creating event: " + request.getTitle());
            EventResponse response = eventService.createEvent(request);
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            System.out.println("Error creating event: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update event (ORGANIZER only - can only update own events)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = eventServiceImpl.processValidationErrors(bindingResult);
                return ResponseEntity.badRequest().body(errors);
            }

            // Fixed: Use LocalDateTime instead of LocalDate for comparison
            if (request.getDate().isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("date", "Date must be in the future"));
            }

            if ("PRIVATE".equalsIgnoreCase(request.getEventType()) &&
                    (request.getPrivateCode() == null || request.getPrivateCode().trim().isEmpty())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("privateCode", "Private code is required for private events"));
            }

            System.out.println("Updating event ID: " + id);
            EventResponse response = eventService.updateEvent(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error updating event: " + e.getMessage());
            if (e.getMessage().contains("You can only update your own events")) {
                return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete/Cancel event (ORGANIZER only - can only delete own events)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            System.out.println("Deleting event ID: " + id);
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build(); // 204 No Content
        } catch (Exception e) {
            System.out.println("Error deleting event: " + e.getMessage());
            if (e.getMessage().contains("You can only delete your own events")) {
                return ResponseEntity.status(403).body(Map.of("error", e.getMessage()));
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ===== ADMIN ENDPOINTS =====

    /**
     * Admin can delete any event
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> adminDeleteEvent(@PathVariable Long id) {
        try {
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            System.out.println("Admin delete error: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}