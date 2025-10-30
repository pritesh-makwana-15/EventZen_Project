// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/service/impl/EventServiceImpl.java
// CHANGES: Updated repository method calls to use DESC sorting
// ================================================================

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
import com.eventzen.dto.response.EventResponse;
import com.eventzen.entity.Event;
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
        System.out.println("Event created successfully with ID: " + savedEvent.getId());

        return convertToResponse(savedEvent, organizer.getName());
    }

    @Override
    public EventResponse updateEvent(Long eventId, EventRequest request) throws Exception {
        System.out.println("Updating event with ID: " + eventId);

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

        System.out.println("Event updated successfully");
        return convertToResponse(updatedEvent, organizerName);
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) throws Exception {
        System.out.println("=== DELETE EVENT START (Organizer) ===");
        System.out.println("Deleting event with ID: " + eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        Long currentUserId = getCurrentUserId();

        if (!event.getOrganizerId().equals(currentUserId)) {
            throw new Exception("You can only delete your own events");
        }

        try {
            long registrationCount = registrationRepository.countByEventId(eventId);
            System.out.println("Event has " + registrationCount + " registrations to be deleted");

            if (registrationCount > 0) {
                registrationRepository.deleteByEventId(eventId);
                System.out.println("✅ Deleted " + registrationCount + " registrations for event ID: " + eventId);
            }

            eventRepository.delete(event);
            System.out.println("✅ Event deleted successfully");
            System.out.println("=== DELETE EVENT END ===");

        } catch (DataIntegrityViolationException e) {
            System.err.println("❌ FK constraint error: " + e.getMessage());
            e.printStackTrace();
            throw new Exception("Cannot delete event due to database constraint. Please contact support.");
        } catch (Exception e) {
            System.err.println("❌ Error during event deletion: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteEventAdmin(Long eventId) throws Exception {
        System.out.println("=== ADMIN DELETE EVENT START ===");
        System.out.println("Admin deleting event with ID: " + eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        try {
            long registrationCount = registrationRepository.countByEventId(eventId);
            System.out.println("Event has " + registrationCount + " registrations to be deleted");

            if (registrationCount > 0) {
                registrationRepository.deleteByEventId(eventId);
                System.out.println("✅ Deleted " + registrationCount + " registrations");
            }

            eventRepository.delete(event);
            System.out.println("✅ Admin deleted event successfully");
            System.out.println("=== ADMIN DELETE EVENT END ===");

        } catch (DataIntegrityViolationException e) {
            System.err.println("❌ FK constraint error: " + e.getMessage());
            e.printStackTrace();
            throw new Exception("Cannot delete event due to database constraint. Please contact support.");
        } catch (Exception e) {
            System.err.println("❌ Error during admin event deletion: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Override
    public EventResponse getEventById(Long eventId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        User organizer = userRepository.findById(event.getOrganizerId()).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return convertToResponse(event, organizerName);
    }

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

    @Override
    public List<EventResponse> getEventsByOrganizer(Long organizerId) {
        // UPDATED: Use DESC sorting method
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
        // UPDATED: Use DESC sorting method
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
        // Already DESC from repository
        List<Event> events = eventRepository.findByOrganizerIdAndDateLessThanOrderByDateDesc(organizerId, today);
        User organizer = userRepository.findById(organizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    public Map<String, String> processValidationErrors(BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : bindingResult.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return errors;
    }

    private Long getCurrentUserId() throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new Exception("User not authenticated");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        return user.getId();
    }

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