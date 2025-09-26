package com.eventzen.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
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
import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.request.UpdateOrganizerRequest;
import com.eventzen.dto.response.AdminEventResponse;
import com.eventzen.dto.response.AdminOrganizerResponse;
import com.eventzen.dto.response.AdminVisitorResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.User;
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
    private PasswordEncoder passwordEncoder;

    // ===== EVENTS MANAGEMENT =====
    @GetMapping("/events")
    public ResponseEntity<List<AdminEventResponse>> getAllEvents() {
        List<Event> events = eventService.getAllEventsForAdmin();
        List<AdminEventResponse> eventResponses = events.stream()
                .map(this::convertToAdminEventResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(eventResponses);
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<AdminEventResponse> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventByIdForAdmin(id);
        if (event == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToAdminEventResponse(event));
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<AdminEventResponse> updateEvent(
            @PathVariable Long id,
            @Valid @RequestBody EventRequest eventData) {
        Event updatedEvent = eventService.updateEventAsAdmin(id, eventData);
        if (updatedEvent == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToAdminEventResponse(updatedEvent));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEventAsAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // ===== ORGANIZERS MANAGEMENT =====
    @GetMapping("/organizers")
    public ResponseEntity<List<AdminOrganizerResponse>> getAllOrganizers() {
        List<User> organizers = userService.getAllOrganizers();
        List<AdminOrganizerResponse> organizerResponses = organizers.stream()
                .map(this::convertToAdminOrganizerResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(organizerResponses);
    }

    @GetMapping("/organizers/{id}")
    public ResponseEntity<AdminOrganizerResponse> getOrganizerById(@PathVariable Long id) {
        User organizer = userService.getOrganizerById(id);
        if (organizer == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToAdminOrganizerResponse(organizer));
    }

    @PostMapping("/organizers")
    public ResponseEntity<AdminOrganizerResponse> createOrganizer(
            @Valid @RequestBody CreateOrganizerRequest request) {

        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().build();
        }

        User organizer = new User();
        organizer.setName(request.getName());
        organizer.setEmail(request.getEmail());
        organizer.setPassword(passwordEncoder.encode("defaultPassword123")); // Set default password
        organizer.setPhone(request.getPhone());
        organizer.setOrganization(request.getOrganization());
        organizer.setRole(userService.getOrganizerRole());
        organizer.setActive(true);
        organizer.setCreatedAt(LocalDateTime.now());
        organizer.setUpdatedAt(LocalDateTime.now());

        User savedOrganizer = userService.createOrganizer(organizer);
        return ResponseEntity.ok(convertToAdminOrganizerResponse(savedOrganizer));
    }

    @PutMapping("/organizers/{id}")
    public ResponseEntity<AdminOrganizerResponse> updateOrganizer(
            @PathVariable Long id,
            @Valid @RequestBody UpdateOrganizerRequest request) {

        User organizer = userService.getOrganizerById(id);
        if (organizer == null) {
            return ResponseEntity.notFound().build();
        }

        organizer.setName(request.getName());
        organizer.setPhone(request.getPhone());
        organizer.setOrganization(request.getOrganization());
        organizer.setActive(true); // Assume active for updates
        organizer.setUpdatedAt(LocalDateTime.now());

        User updatedOrganizer = userService.updateOrganizer(organizer);
        return ResponseEntity.ok(convertToAdminOrganizerResponse(updatedOrganizer));
    }

    @PatchMapping("/organizers/{id}/toggle-status")
    public ResponseEntity<AdminOrganizerResponse> toggleOrganizerStatus(@PathVariable Long id) {
        User organizer = userService.toggleOrganizerStatus(id);
        if (organizer == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToAdminOrganizerResponse(organizer));
    }

    @DeleteMapping("/organizers/{id}")
    public ResponseEntity<Void> deleteOrganizer(@PathVariable Long id) {
        userService.deleteOrganizerAsAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // ===== VISITORS MANAGEMENT =====
    @GetMapping("/visitors")
    public ResponseEntity<List<AdminVisitorResponse>> getAllVisitors() {
        List<User> visitors = userService.getAllVisitors();
        List<AdminVisitorResponse> visitorResponses = visitors.stream()
                .map(this::convertToAdminVisitorResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(visitorResponses);
    }

    @GetMapping("/visitors/{id}")
    public ResponseEntity<AdminVisitorResponse> getVisitorById(@PathVariable Long id) {
        User visitor = userService.getVisitorById(id);
        if (visitor == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(convertToAdminVisitorResponse(visitor));
    }

    @DeleteMapping("/visitors/{id}")
    public ResponseEntity<Void> deleteVisitor(@PathVariable Long id) {
        userService.deleteVisitorAsAdmin(id);
        return ResponseEntity.noContent().build();
    }

    // ===== HELPER METHODS =====
    private AdminEventResponse convertToAdminEventResponse(Event event) {
        AdminEventResponse response = new AdminEventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setDate(event.getDate());
        response.setLocation(event.getLocation());
        response.setCategory(event.getCategory());
        response.setImageUrl(event.getImageUrl());
        response.setActive(event.isActive());
        response.setCreatedAt(event.getCreatedAt());

        if (event.getOrganizer() != null) {
            AdminEventResponse.OrganizerInfo organizerInfo = new AdminEventResponse.OrganizerInfo();
            organizerInfo.setId(event.getOrganizer().getId());
            organizerInfo.setName(event.getOrganizer().getName());
            response.setOrganizer(organizerInfo);
        }

        response.setAttendeesCount(eventService.getAttendeesCount(event.getId()));
        return response;
    }

    private AdminOrganizerResponse convertToAdminOrganizerResponse(User user) {
        AdminOrganizerResponse response = new AdminOrganizerResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setOrganization(user.getOrganization());
        response.setActive(user.isActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setEventsCreated(eventService.getEventsCountByOrganizer(user.getId()));
        return response;
    }

    private AdminVisitorResponse convertToAdminVisitorResponse(User user) {
        AdminVisitorResponse response = new AdminVisitorResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setRegisteredEventsCount(userService.getRegisteredEventsCount(user.getId()));
        return response;
    }
}