// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/service/impl/EventServiceImpl.java
// 🆕 COMPLETE FILE - Merged Old + New (Venue Integration)
// This is the FULL, READY-TO-USE file
// ================================================================

package com.eventzen.service.impl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
import com.eventzen.dto.response.EventCalendarResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.RegistrationStatus;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;
import com.eventzen.entity.Venue;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.repository.VenueRepository;
import com.eventzen.service.EventService;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private VenueRepository venueRepository;

    // ================================================================
    // CREATE EVENT - WITH VENUE VALIDATION
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

        // Validate start datetime is in the future
        LocalDateTime startDateTime = LocalDateTime.of(request.getStartDate(), request.getStartTime());
        if (!startDateTime.isAfter(LocalDateTime.now())) {
            throw new Exception("Event start date/time must be in the future");
        }

        // Validate end is after start
        LocalDateTime endDateTime = LocalDateTime.of(request.getEndDate(), request.getEndTime());
        if (!endDateTime.isAfter(startDateTime)) {
            throw new Exception("Event end date/time must be after start date/time");
        }

        // 🆕 NEW: Venue validation and availability check
        Venue venue = null;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new Exception("Venue not found"));

            if (!venue.getIsActive()) {
                throw new Exception("Selected venue is not active");
            }

            // Check venue availability
            List<Event> conflicts = eventRepository.findConflictingEvents(
                    request.getVenueId(),
                    request.getStartDate(),
                    request.getEndDate(),
                    -1L // No event to exclude for new event
            );

            if (!conflicts.isEmpty()) {
                throw new Exception("Venue is not available for the selected date/time. Conflicting events exist.");
            }
        }

        Event event = new Event();
        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setStartTime(request.getStartTime());
        event.setEndDate(request.getEndDate());
        event.setEndTime(request.getEndTime());
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
        event.setVenue(venue); // 🆕 NEW: Set venue

        Event savedEvent = eventRepository.save(event);

        return convertToResponse(savedEvent, organizer.getName());
    }

    // ================================================================
    // UPDATE EVENT - WITH VENUE VALIDATION
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

        // Validate start datetime is in the future
        LocalDateTime startDateTime = LocalDateTime.of(request.getStartDate(), request.getStartTime());
        if (!startDateTime.isAfter(LocalDateTime.now())) {
            throw new Exception("Event start date/time must be in the future");
        }

        // Validate end is after start
        LocalDateTime endDateTime = LocalDateTime.of(request.getEndDate(), request.getEndTime());
        if (!endDateTime.isAfter(startDateTime)) {
            throw new Exception("Event end date/time must be after start date/time");
        }

        // 🆕 NEW: Venue validation and availability check
        Venue venue = null;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new Exception("Venue not found"));

            if (!venue.getIsActive()) {
                throw new Exception("Selected venue is not active");
            }

            // Check venue availability (exclude current event)
            List<Event> conflicts = eventRepository.findConflictingEvents(
                    request.getVenueId(),
                    request.getStartDate(),
                    request.getEndDate(),
                    eventId // Exclude current event from conflict check
            );

            if (!conflicts.isEmpty()) {
                throw new Exception("Venue is not available for the selected date/time. Conflicting events exist.");
            }
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setStartTime(request.getStartTime());
        event.setEndDate(request.getEndDate());
        event.setEndTime(request.getEndTime());
        event.setState(request.getState());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setCategory(request.getCategory());
        event.setImageUrl(request.getImageUrl());
        event.setMaxAttendees(request.getMaxAttendees());
        event.setEventType(request.getEventType());
        event.setPrivateCode(request.getPrivateCode());
        event.setVenue(venue); // 🆕 NEW: Update venue

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
        List<Event> events = eventRepository.findByOrganizerIdOrderByStartDateDesc(organizerId);
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
        List<Event> events = eventRepository.findByOrganizerIdAndStartDateGreaterThanEqualOrderByStartDateDesc(
                organizerId, today);

        User organizer = userRepository.findById(organizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    public List<EventResponse> getPastEventsByOrganizer(Long organizerId) throws Exception {
        LocalDate today = LocalDate.now();
        List<Event> events = eventRepository.findByOrganizerIdAndEndDateLessThanOrderByEndDateDesc(
                organizerId, today);

        User organizer = userRepository.findById(organizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    // ================================================================
    // VISITOR REGISTRATION
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

        // Create registration
        Registration registration = new Registration();
        registration.setVisitor(visitor);
        registration.setEvent(event);
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registration.setRegisteredAt(LocalDateTime.now());
        registration.setPhone(request.getPhone());
        registration.setNotes(request.getNotes());

        Registration saved = registrationRepository.save(registration);

        // Update event count
        event.setCurrentAttendees(current + 1);
        eventRepository.save(event);

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
    // EVENT → DTO - WITH VENUE INFO
    // ================================================================
    private EventResponse convertToResponse(Event event, String organizerName) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setDescription(event.getDescription());
        response.setStartDate(event.getStartDate());
        response.setStartTime(event.getStartTime());
        response.setEndDate(event.getEndDate());
        response.setEndTime(event.getEndTime());
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

        // 🆕 NEW: Add venue information
        if (event.getVenue() != null) {
            response.setVenueId(event.getVenue().getId());
            response.setVenueName(event.getVenue().getName());
            response.setVenueAddress(event.getVenue().getLocation());
        }

        return response;
    }

    // ================================================================
    // GET EVENTS FOR CALENDAR (ADMIN)
    // ================================================================
    public List<EventResponse> getEventsForCalendar(
            LocalDate startDate,
            LocalDate endDate,
            String category,
            String city,
            Long organizerId,
            String eventType) {

        System.out.println("📅 Fetching calendar events: " + startDate + " to " + endDate);

        List<Event> events;

        if (startDate != null && endDate != null) {
            events = eventRepository.findByStartDateBetween(startDate, endDate);
        } else {
            events = eventRepository.findAll();
        }

        // Apply filters
        if (category != null && !category.isEmpty()) {
            events = events.stream()
                    .filter(e -> category.equalsIgnoreCase(e.getCategory()))
                    .collect(Collectors.toList());
        }

        if (city != null && !city.isEmpty()) {
            events = events.stream()
                    .filter(e -> city.equalsIgnoreCase(e.getCity()))
                    .collect(Collectors.toList());
        }

        if (organizerId != null) {
            events = events.stream()
                    .filter(e -> organizerId.equals(e.getOrganizerId()))
                    .collect(Collectors.toList());
        }

        if (eventType != null && !eventType.isEmpty()) {
            events = events.stream()
                    .filter(e -> eventType.equalsIgnoreCase(e.getEventType()))
                    .collect(Collectors.toList());
        }

        return events.stream()
                .map(event -> {
                    User organizer = userRepository.findById(event.getOrganizerId()).orElse(null);
                    String organizerName = organizer != null ? organizer.getName() : "Unknown";
                    return convertToResponse(event, organizerName);
                })
                .collect(Collectors.toList());
    }

    // ================================================================
    // GET EVENTS FOR ORGANIZER CALENDAR
    // ================================================================
    public List<EventResponse> getEventsForOrganizerCalendar(
            LocalDate startDate,
            LocalDate endDate,
            Long organizerId,
            String category) throws Exception {

        System.out.println("📅 Fetching organizer calendar events: " + startDate + " to " + endDate);

        Long currentOrganizerId = getCurrentUserId();

        if (organizerId != null && !organizerId.equals(currentOrganizerId)) {
            throw new Exception("You can only view your own events");
        }

        List<Event> events;

        if (startDate != null && endDate != null) {
            events = eventRepository.findByOrganizerIdAndDateBetween(
                    currentOrganizerId, startDate, endDate);
        } else {
            events = eventRepository.findByOrganizerId(currentOrganizerId);
        }

        if (category != null && !category.isEmpty()) {
            events = events.stream()
                    .filter(e -> category.equalsIgnoreCase(e.getCategory()))
                    .collect(Collectors.toList());
        }

        User organizer = userRepository.findById(currentOrganizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    // ================================================================
    // GET ALL CATEGORIES
    // ================================================================
    public List<String> getAllCategories() {
        try {
            List<Event> events = eventRepository.findAll();
            Set<String> categories = new HashSet<>();

            for (Event event : events) {
                if (event.getCategory() != null && !event.getCategory().isEmpty()) {
                    categories.add(event.getCategory());
                }
            }

            if (categories.isEmpty()) {
                categories.add("Technology");
                categories.add("Business");
                categories.add("Music");
                categories.add("Health");
                categories.add("Food");
                categories.add("Art");
                categories.add("Community");
                categories.add("Entertainment");
                categories.add("Education");
                categories.add("Sports");
                categories.add("Other");
            }

            List<String> sortedCategories = new ArrayList<>(categories);
            Collections.sort(sortedCategories);
            return sortedCategories;
        } catch (Exception e) {
            System.err.println("Error fetching categories: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // ================================================================
    // GET ALL CITIES
    // ================================================================
    public List<String> getAllCities() {
        try {
            List<Event> events = eventRepository.findAll();
            Set<String> cities = new HashSet<>();

            for (Event event : events) {
                if (event.getCity() != null && !event.getCity().isEmpty()) {
                    cities.add(event.getCity());
                }
            }

            List<String> sortedCities = new ArrayList<>(cities);
            Collections.sort(sortedCities);
            return sortedCities;
        } catch (Exception e) {
            System.err.println("Error fetching cities: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    // ================================================================
    // ADMIN UPDATE EVENT (NO OWNERSHIP CHECK)
    // ================================================================
    public EventResponse adminUpdateEvent(Long eventId, EventRequest request) throws Exception {
        System.out.println("Admin updating event ID: " + eventId);

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        LocalDateTime startDateTime = LocalDateTime.of(request.getStartDate(), request.getStartTime());
        LocalDateTime endDateTime = LocalDateTime.of(request.getEndDate(), request.getEndTime());

        if (!endDateTime.isAfter(startDateTime)) {
            throw new Exception("Event end date/time must be after start date/time");
        }

        // 🆕 NEW: Venue validation for admin update
        Venue venue = null;
        if (request.getVenueId() != null) {
            venue = venueRepository.findById(request.getVenueId())
                    .orElseThrow(() -> new Exception("Venue not found"));

            if (!venue.getIsActive()) {
                throw new Exception("Selected venue is not active");
            }

            List<Event> conflicts = eventRepository.findConflictingEvents(
                    request.getVenueId(),
                    request.getStartDate(),
                    request.getEndDate(),
                    eventId);

            if (!conflicts.isEmpty()) {
                throw new Exception("Venue is not available for the selected date/time.");
            }
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setStartDate(request.getStartDate());
        event.setStartTime(request.getStartTime());
        event.setEndDate(request.getEndDate());
        event.setEndTime(request.getEndTime());
        event.setState(request.getState());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setCategory(request.getCategory());
        event.setImageUrl(request.getImageUrl());
        event.setMaxAttendees(request.getMaxAttendees());
        event.setEventType(request.getEventType());
        event.setPrivateCode(request.getPrivateCode());
        event.setVenue(venue); // 🆕 NEW: Update venue

        Event updatedEvent = eventRepository.save(event);

        User organizer = userRepository.findById(event.getOrganizerId()).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return convertToResponse(updatedEvent, organizerName);
    }

    // ================================================================
    // GET EVENTS FOR VISITOR CALENDAR
    // ================================================================
    public List<EventCalendarResponse> getEventsForVisitorCalendar(
            LocalDate startDate,
            LocalDate endDate) throws Exception {

        System.out.println("📅 Fetching visitor calendar events: " + startDate + " to " + endDate);

        Long currentVisitorId = getCurrentUserId();

        User visitor = userRepository.findById(currentVisitorId)
                .orElseThrow(() -> new Exception("Visitor not found"));

        if (visitor.getRole() != Role.VISITOR) {
            throw new Exception("Only visitors can access this endpoint");
        }

        List<Registration> registrations = registrationRepository.findByVisitor(visitor)
                .stream()
                .filter(reg -> reg.getStatus() != RegistrationStatus.CANCELLED)
                .collect(Collectors.toList());

        if (registrations.isEmpty()) {
            return new ArrayList<>();
        }

        Set<Long> registeredEventIds = registrations.stream()
                .map(reg -> reg.getEvent().getId())
                .collect(Collectors.toSet());

        List<Event> events = eventRepository.findAll().stream()
                .filter(event -> registeredEventIds.contains(event.getId()))
                .filter(event -> {
                    boolean startsInRange = !event.getStartDate().isBefore(startDate) &&
                            !event.getStartDate().isAfter(endDate);
                    boolean endsInRange = !event.getEndDate().isBefore(startDate) &&
                            !event.getEndDate().isAfter(endDate);
                    boolean spansRange = event.getStartDate().isBefore(startDate) &&
                            event.getEndDate().isAfter(endDate);

                    return startsInRange || endsInRange || spansRange;
                })
                .collect(Collectors.toList());

        return events.stream()
                .map(event -> {
                    User organizer = userRepository.findById(event.getOrganizerId()).orElse(null);
                    String organizerName = organizer != null ? organizer.getName() : "Unknown";

                    Registration registration = registrations.stream()
                            .filter(reg -> reg.getEvent().getId().equals(event.getId()))
                            .findFirst()
                            .orElse(null);

                    LocalDateTime now = LocalDateTime.now();
                    LocalDateTime eventEnd = LocalDateTime.of(event.getEndDate(), event.getEndTime());
                    String status = eventEnd.isAfter(now) ? "UPCOMING" : "COMPLETED";

                    return convertToCalendarResponse(event, organizerName, registration, status);
                })
                .collect(Collectors.toList());
    }

    private EventCalendarResponse convertToCalendarResponse(
            Event event,
            String organizerName,
            Registration registration,
            String status) {

        EventCalendarResponse response = new EventCalendarResponse();
        response.setId(event.getId());
        response.setTitle(event.getTitle());
        response.setStartDate(event.getStartDate());
        response.setStartTime(event.getStartTime());
        response.setEndDate(event.getEndDate());
        response.setEndTime(event.getEndTime());
        response.setCategory(event.getCategory());
        response.setColor(getCategoryColorHex(event.getCategory()));
        response.setOrganizerName(organizerName);
        response.setIsPublic(!"PRIVATE".equalsIgnoreCase(event.getEventType()));
        response.setRegistrationStatus(registration != null ? registration.getStatus().toString() : "NONE");
        response.setRegistrationCount(event.getCurrentAttendees() != null ? event.getCurrentAttendees() : 0);
        response.setCapacity(event.getMaxAttendees() != null ? event.getMaxAttendees() : 0);
        response.setStatus(status);
        response.setLocation(
                event.getLocation() != null ? event.getLocation() : event.getCity() + ", " + event.getState());
        response.setDescription(event.getDescription());
        response.setImageUrl(event.getImageUrl());

        return response;
    }

    private String getCategoryColorHex(String category) {
        Map<String, String> colors = new HashMap<>();
        colors.put("Technology", "#667eea");
        colors.put("Business", "#f59e0b");
        colors.put("Music", "#ec4899");
        colors.put("Health", "#10b981");
        colors.put("Food", "#f97316");
        colors.put("Art", "#8b5cf6");
        colors.put("Community", "#3b82f6");
        colors.put("Entertainment", "#ef4444");
        colors.put("Education", "#06b6d4");
        colors.put("Sports", "#84cc16");

        return colors.getOrDefault(category, "#6b7280");
    }
}

// ================================================================
// END OF FILE - COMPLETE AND READY TO USE
// ================================================================