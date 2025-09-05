package com.eventzen.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventServiceImpl eventServiceImpl; // For additional methods

    // ===== PUBLIC ENDPOINTS (No authentication required) =====

    /**
     * Get all events (public - for visitors)
     */
    @GetMapping
    public List<EventResponse> getAllEvents() {
        System.out.println("Fetching all public events");
        return eventService.getAllEvents();
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
    public List<EventResponse> getEventsByOrganizer(@PathVariable Long organizerId) {
        System.out.println("Fetching events for organizer ID: " + organizerId);
        return eventService.getEventsByOrganizer(organizerId);
    }

    // ===== ORGANIZER-ONLY ENDPOINTS (Authentication + Authorization required)
    // =====

    /**
     * Create new event (ORGANIZER only)
     */
    @PostMapping
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<EventResponse> createEvent(@RequestBody EventRequest request) {
        try {
            System.out.println("Creating event: " + request.getTitle());
            EventResponse response = eventService.createEvent(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error creating event: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update event (ORGANIZER only - can only update own events)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<EventResponse> updateEvent(@PathVariable Long id, @RequestBody EventRequest request) {
        try {
            System.out.println("Updating event ID: " + id);
            EventResponse response = eventService.updateEvent(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Error updating event: " + e.getMessage());
            if (e.getMessage().contains("You can only update your own events")) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete/Cancel event (ORGANIZER only - can only delete own events)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        try {
            System.out.println("Deleting event ID: " + id);
            eventService.deleteEvent(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("Error deleting event: " + e.getMessage());
            if (e.getMessage().contains("You can only delete your own events")) {
                return ResponseEntity.status(403).build(); // Forbidden
            }
            if (e.getMessage().contains("Event not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== ORGANIZER DASHBOARD ENDPOINTS =====

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

    // ===== ADMIN ENDPOINTS (Future use) =====

    /**
     * Admin can delete any event
     */
    @DeleteMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> adminDeleteEvent(@PathVariable Long id) {
        try {
            // Admin can delete any event without ownership check
            eventService.deleteEvent(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.out.println("Admin delete error: " + e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}