// ================================================================
// FILE: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\controller\EventController.java
// 🆕 UPDATED: Added Admin Calendar endpoints for date-range filtering
// ================================================================

package com.eventzen.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.request.VisitorRegistrationRequest;
import com.eventzen.dto.response.EventResponse;
import com.eventzen.dto.response.RegistrationResponse;
import com.eventzen.service.EventService;
import com.eventzen.service.impl.EventServiceImpl;
import com.eventzen.dto.response.EventCalendarResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventServiceImpl eventServiceImpl;

    // ===== PUBLIC ENDPOINTS =====

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        System.out.println("Fetching all public events");
        List<EventResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(events);
    }

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

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventResponse>> getEventsByOrganizer(@PathVariable Long organizerId) {
        System.out.println("Fetching events for organizer ID: " + organizerId);
        List<EventResponse> events = eventService.getEventsByOrganizer(organizerId);
        return ResponseEntity.ok(events);
    }

    // ===== ORGANIZER DASHBOARD ENDPOINTS =====

    @GetMapping("/organizer/{organizerId}/upcoming")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<List<EventResponse>> getUpcomingEvents(@PathVariable Long organizerId) {
        try {
            System.out.println("Fetching upcoming events for organizer: " + organizerId);
            List<EventResponse> events = eventServiceImpl.getUpcomingEventsByOrganizer(organizerId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            System.out.println("Error fetching upcoming events: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/organizer/{organizerId}/past")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<List<EventResponse>> getPastEvents(@PathVariable Long organizerId) {
        try {
            System.out.println("Fetching past events for organizer: " + organizerId);
            List<EventResponse> events = eventServiceImpl.getPastEventsByOrganizer(organizerId);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            System.out.println("Error fetching past events: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

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

    @PostMapping
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<?> createEvent(@Valid @RequestBody EventRequest request, BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = eventServiceImpl.processValidationErrors(bindingResult);
                return ResponseEntity.badRequest().body(errors);
            }

            if (request.getStartDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body(Map.of("startDate", "Start date must be today or later"));
            }

            LocalDateTime start = LocalDateTime.of(request.getStartDate(), request.getStartTime());
            LocalDateTime end = LocalDateTime.of(request.getEndDate(), request.getEndTime());

            if (!end.isAfter(start)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("endDate", "End date/time must be after start date/time"));
            }

            if (!start.isAfter(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("startDate", "Event must start in the future"));
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

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<?> updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = eventServiceImpl.processValidationErrors(bindingResult);
                return ResponseEntity.badRequest().body(errors);
            }

            if (request.getStartDate().isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest().body(Map.of("startDate", "Start date must be today or later"));
            }

            LocalDateTime start = LocalDateTime.of(request.getStartDate(), request.getStartTime());
            LocalDateTime end = LocalDateTime.of(request.getEndDate(), request.getEndTime());

            if (!end.isAfter(start)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("endDate", "End date/time must be after start date/time"));
            }

            if (!start.isAfter(LocalDateTime.now())) {
                return ResponseEntity.badRequest().body(Map.of("startDate", "Event must start in the future"));
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

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<?> deleteEvent(@PathVariable Long id) {
        try {
            System.out.println("Deleting event ID: " + id);
            eventService.deleteEvent(id);
            return ResponseEntity.noContent().build();
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

    // ===== 🆕 NEW: ORGANIZER CALENDAR ENDPOINT =====

    /**
     * Get events for organizer calendar view
     * Filtered by current organizer's JWT token
     * 
     * @param startDate - Calendar view start date
     * @param endDate   - Calendar view end date
     * @param category  - Optional category filter
     * @return List of organizer's events in the date range
     */
    @GetMapping("/organizer/calendar")
    @PreAuthorize("hasAuthority('ORGANIZER')")
    public ResponseEntity<List<EventResponse>> getEventsForOrganizerCalendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long organizerId,
            @RequestParam(required = false) String category) {
        try {
            System.out.println("📅 Organizer Calendar request: " + startDate + " to " + endDate);

            // Get events filtered by JWT organizer
            List<EventResponse> events = eventServiceImpl.getEventsForOrganizerCalendar(
                    startDate, endDate, organizerId, category);

            return ResponseEntity.ok(events);
        } catch (Exception e) {
            System.out.println("Error fetching organizer calendar events: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== 🆕 NEW: VISITOR CALENDAR ENDPOINT =====

    /**
     * Get events for visitor calendar view
     * Returns only events that the authenticated visitor is registered for
     * 
     * @param from - Calendar view start date (YYYY-MM-DD)
     * @param to   - Calendar view end date (YYYY-MM-DD)
     * @return List of visitor's registered events in the date range
     */
    @GetMapping("/visitor/calendar/events")
    @PreAuthorize("hasAuthority('VISITOR')")
    public ResponseEntity<List<EventCalendarResponse>> getEventsForVisitorCalendar(
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String from,
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String to) {
        try {
            System.out.println("📅 Visitor Calendar request: " + from + " to " + to);

            LocalDate startDate = LocalDate.parse(from);
            LocalDate endDate = LocalDate.parse(to);

            // Get events filtered by visitor's registrations
            List<EventCalendarResponse> events = eventServiceImpl.getEventsForVisitorCalendar(
                    startDate, endDate);

            return ResponseEntity.ok(events);
        } catch (Exception e) {
            System.out.println("Error fetching visitor calendar events: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== ADMIN ENDPOINTS =====

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

    // 🆕 NEW: Admin Update Event
    @PutMapping("/admin/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> adminUpdateEvent(@PathVariable Long id, @Valid @RequestBody EventRequest request,
            BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = eventServiceImpl.processValidationErrors(bindingResult);
                return ResponseEntity.badRequest().body(errors);
            }

            System.out.println("Admin updating event ID: " + id);
            EventResponse response = eventServiceImpl.adminUpdateEvent(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("Admin update error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // 🆕 NEW: Calendar endpoint - Get events by date range with filters
    @GetMapping("/admin/calendar")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<EventResponse>> getEventsForCalendar(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long organizerId,
            @RequestParam(required = false) String eventType) {
        try {
            System.out.println("📅 Calendar request: " + startDate + " to " + endDate);
            List<EventResponse> events = eventServiceImpl.getEventsForCalendar(
                    startDate, endDate, category, city, organizerId, eventType);
            return ResponseEntity.ok(events);
        } catch (Exception e) {
            System.out.println("Error fetching calendar events: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // 🆕 NEW: Get all unique categories
    @GetMapping("/admin/categories")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<String>> getAllCategories() {
        try {
            List<String> categories = eventServiceImpl.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // 🆕 NEW: Get all unique cities
    @GetMapping("/admin/cities")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<String>> getAllCities() {
        try {
            List<String> cities = eventServiceImpl.getAllCities();
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ===== VISITOR REGISTRATION ENDPOINT =====

    @PostMapping("/{eventId}/register")
    public ResponseEntity<?> registerVisitorForEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody VisitorRegistrationRequest request,
            BindingResult bindingResult) {
        try {
            System.out.println("=== VISITOR REGISTRATION REQUEST ===");
            System.out.println("Event ID: " + eventId);

            if (bindingResult.hasErrors()) {
                Map<String, String> errors = eventServiceImpl.processValidationErrors(bindingResult);
                return ResponseEntity.badRequest().body(errors);
            }

            RegistrationResponse response = eventServiceImpl.registerVisitorForEvent(eventId, request);
            System.out.println("Registration successful!");
            return ResponseEntity.status(201).body(response);

        } catch (Exception e) {
            System.err.println("Registration error: " + e.getMessage());

            if (e.getMessage().contains("Private code is not correct")) {
                return ResponseEntity.status(403).body(Map.of("message", "Invalid private code"));
            }
            if (e.getMessage().contains("already registered")) {
                return ResponseEntity.status(409).body(Map.of("message", "You are already registered for this event"));
            }
            if (e.getMessage().contains("maximum attendees reached")) {
                return ResponseEntity.status(409).body(Map.of("message", "Event is full - registration closed"));
            }
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(404).body(Map.of("message", "Event not found"));
            }

            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}