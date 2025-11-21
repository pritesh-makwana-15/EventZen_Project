// =====================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/service/impl/EventServiceImpl.java
// MERGED VERSION: Old + New Visitor Registration Endpoint
// =====================================================================

package com.eventzen.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.request.VisitorRegistrationRequest;
import com.eventzen.dto.response.EventResponse;
import com.eventzen.dto.response.RegistrationResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.RegistrationStatus;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.EventService;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    // ================================================================
    // CREATE EVENT
    // ================================================================
    @Override
    public EventResponse createEvent(EventRequest request) throws Exception {
        System.out.println("Creating new event: " + request.getTitle());

        Long organizerId = getCurrentUserId();
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new Exception("Organizer not found"));

        if (organizer.getRole() != Role.ORGANIZER) {
            throw new Exception("Only organizers can create events");
        }

        if (request.getDate().isBefore(LocalDate.now())) {
            throw new Exception("Event date cannot be in the past");
        }

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setState(request.getState());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setCategory(request.getCategory());
        event.setImageUrl(request.getImageUrl());
        event.setOrganizerId(organizerId);
        event.setMaxAttendees(request.getMaxAttendees());
        event.setEventType(request.getEventType() != null ? request.getEventType() : "PUBLIC");
        event.setPrivateCode(request.getPrivateCode());
        event.setIsActive(true);

        Event savedEvent = eventRepository.save(event);

        return convertToResponse(savedEvent, organizer.getName());
    }

    // ================================================================
    // UPDATE EVENT
    // ================================================================
    @Override
    public EventResponse updateEvent(Long eventId, EventRequest request) throws Exception {
        System.out.println("Updating event ID: " + eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        Long currentUserId = getCurrentUserId();

        if (!event.getOrganizerId().equals(currentUserId)) {
            throw new Exception("You can only update your own events");
        }

        if (request.getDate().isBefore(LocalDate.now())) {
            throw new Exception("Event date cannot be in the past");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setState(request.getState());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setCategory(request.getCategory());
        event.setImageUrl(request.getImageUrl());
        event.setMaxAttendees(request.getMaxAttendees());
        event.setEventType(request.getEventType());
        event.setPrivateCode(request.getPrivateCode());

        Event updatedEvent = eventRepository.save(event);

        User organizer = userRepository.findById(currentUserId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return convertToResponse(updatedEvent, organizerName);
    }

    // ================================================================
    // DELETE EVENT (ORGANIZER)
    // ================================================================
    @Override
    @Transactional
    public void deleteEvent(Long eventId) throws Exception {
        System.out.println("Deleting event ID: " + eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        Long currentUserId = getCurrentUserId();

        if (!event.getOrganizerId().equals(currentUserId)) {
            throw new Exception("You can only delete your own events");
        }

        try {
            long registrationCount = registrationRepository.countByEventId(eventId);

            if (registrationCount > 0) {
                registrationRepository.deleteByEventId(eventId);
            }

            eventRepository.delete(event);

        } catch (DataIntegrityViolationException e) {
            throw new Exception("Cannot delete event due to database constraint");
        }
    }

    // ================================================================
    // DELETE EVENT (ADMIN)
    // ================================================================
    @Transactional
    public void deleteEventAdmin(Long eventId) throws Exception {
        System.out.println("Admin deleting event ID: " + eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        long registrationCount = registrationRepository.countByEventId(eventId);

        if (registrationCount > 0) {
            registrationRepository.deleteByEventId(eventId);
        }

        eventRepository.delete(event);
    }

    // ================================================================
    // GET EVENT BY ID
    // ================================================================
    @Override
    public EventResponse getEventById(Long eventId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        User organizer = userRepository.findById(event.getOrganizerId()).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return convertToResponse(event, organizerName);
    }

    // ================================================================
    // GET ALL EVENTS
    // ================================================================
    @Override
    public List<EventResponse> getAllEvents() {
        List<Event> events = eventRepository.findAll();
        return events.stream()
                .map(event -> {
                    User organizer = userRepository.findById(event.getOrganizerId()).orElse(null);
                    String organizerName = organizer != null ? organizer.getName() : "Unknown";
                    return convertToResponse(event, organizerName);
                })
                .collect(Collectors.toList());
    }

    // ================================================================
    // GET EVENTS BY ORGANIZER
    // ================================================================
    @Override
    public List<EventResponse> getEventsByOrganizer(Long organizerId) {
        List<Event> events = eventRepository.findByOrganizerIdOrderByDateDesc(organizerId);
        User organizer = userRepository.findById(organizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    public List<EventResponse> getMyEvents() throws Exception {
        Long currentUserId = getCurrentUserId();
        return getEventsByOrganizer(currentUserId);
    }

    public List<EventResponse> getUpcomingEventsByOrganizer(Long organizerId) throws Exception {
        LocalDate today = LocalDate.now();
        List<Event> events = eventRepository.findByOrganizerIdAndDateGreaterThanEqualOrderByDateDesc(organizerId,
                today);

        User organizer = userRepository.findById(organizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    public List<EventResponse> getPastEventsByOrganizer(Long organizerId) throws Exception {
        LocalDate today = LocalDate.now();
        List<Event> events = eventRepository.findByOrganizerIdAndDateLessThanOrderByDateDesc(organizerId, today);

        User organizer = userRepository.findById(organizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    // ================================================================
    // NEW: VISITOR REGISTRATION (MERGED)
    // ================================================================
    @Transactional
    public RegistrationResponse registerVisitorForEvent(Long eventId, VisitorRegistrationRequest request)
            throws Exception {

        System.out.println("=== VISITOR REGISTRATION START ===");

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        if (event.getIsActive() == null || !event.getIsActive()) {
            throw new Exception("This event is no longer active");
        }

        // Private code validation
        if ("PRIVATE".equalsIgnoreCase(event.getEventType())) {
            String provided = request.getPrivateCode();
            String actual = event.getPrivateCode();

            if (provided == null || provided.trim().isEmpty()) {
                throw new Exception("Private code is required for this event");
            }
            if (!provided.trim().equals(actual)) {
                throw new Exception("Private code is not correct");
            }
        }

        // Find visitor by email
        User visitor = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (visitor == null) {
            throw new Exception("User not found. Please login or register first.");
        }

        // Check duplicate
        boolean registered = registrationRepository.findByVisitor(visitor)
                .stream()
                .anyMatch(reg -> reg.getEvent().getId().equals(eventId)
                        && reg.getStatus() != RegistrationStatus.CANCELLED);

        if (registered) {
            throw new Exception("You are already registered for this event");
        }

        // Capacity check
        int max = event.getMaxAttendees() != null ? event.getMaxAttendees() : Integer.MAX_VALUE;
        int current = event.getCurrentAttendees() != null ? event.getCurrentAttendees() : 0;

        if (current >= max) {
            throw new Exception("Registration closed - maximum attendees reached");
        }

        // Save registration
        // Step 7: Create registration
        Registration registration = new Registration();
        registration.setVisitor(visitor);
        registration.setEvent(event);
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registration.setRegisteredAt(LocalDateTime.now());
        // 🆕 Store phone and notes from form
        registration.setPhone(request.getPhone());
        registration.setNotes(request.getNotes());

        Registration saved = registrationRepository.save(registration);

        // Update event count
        event.setCurrentAttendees(current + 1);
        eventRepository.save(event);

        // Return DTO
        return new RegistrationResponse(
                saved.getId(),
                event.getId(),
                visitor.getId(),
                saved.getStatus(),
                saved.getRegisteredAt());
    }

    // ================================================================
    // VALIDATION ERROR MAP
    // ================================================================
    public Map<String, String> processValidationErrors(BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : bindingResult.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return errors;
    }

    // ================================================================
    // CURRENT USER ID
    // ================================================================
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

    // ================================================================
    // EVENT → DTO
    // ================================================================
    private EventResponse convertToResponse(Event event, String organizerName) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());

        LocalDateTime dateTime = LocalDateTime.of(event.getDate(), event.getTime());
        response.setDate(dateTime);

        response.setLocation(event.getLocation());
        response.setCategory(event.getCategory());
        response.setImageUrl(event.getImageUrl());
        response.setOrganizerId(event.getOrganizerId());
        response.setOrganizerName(organizerName);
        response.setMaxAttendees(event.getMaxAttendees());
        response.setCurrentAttendees(event.getCurrentAttendees());
        response.setIsActive(event.getIsActive());
        response.setEventType(event.getEventType());
        response.setPrivateCode(event.getPrivateCode());
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());

        return response;
    }
}
