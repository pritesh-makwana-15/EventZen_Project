// EventServiceImpl.java (REPLACE)
package com.eventzen.service.impl;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.response.EventResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.EventService;

@Service
public class EventServiceImpl implements EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public EventResponse createEvent(EventRequest request) throws Exception {
        System.out.println("Creating new event: " + request.getTitle());

        Long organizerId = getCurrentUserId();
        User organizer = userRepository.findById(organizerId)
                .orElseThrow(() -> new Exception("Organizer not found"));

        if (organizer.getRole() != Role.ORGANIZER) {
            throw new Exception("Only organizers can create events");
        }

        if (request.getDate().isBefore(LocalDateTime.now())) {
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
        event.setLocation(request.getLocation());
        event.setCategory(request.getCategory());
        event.setImageUrl(request.getImageUrl());
        event.setOrganizer(organizer);
        event.setOrganizerId(organizerId);
        event.setMaxAttendees(request.getMaxAttendees());
        event.setEventType(request.getEventType() != null ? request.getEventType() : "PUBLIC");
        event.setPrivateCode(request.getPrivateCode());
        event.setActive(true);

        Event savedEvent = eventRepository.save(event);
        System.out.println("Event created successfully with ID: " + savedEvent.getId());

        return convertToResponse(savedEvent, organizer.getName());
    }

    @Override
    public EventResponse updateEvent(Long eventId, EventRequest request) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        Long currentUserId = getCurrentUserId();
        if (!event.getOrganizerId().equals(currentUserId)) {
            throw new Exception("You can only update your own events");
        }

        if (request.getDate().isBefore(LocalDateTime.now())) {
            throw new Exception("Event date cannot be in the past");
        }

        event.setTitle(request.getTitle());
        event.setDescription(request.getDescription());
        event.setDate(request.getDate());
        event.setTime(request.getTime());
        event.setState(request.getState());
        event.setCity(request.getCity());
        event.setAddress(request.getAddress());
        event.setLocation(request.getLocation());
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

    @Override
    public void deleteEvent(Long eventId) throws Exception {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new Exception("Event not found"));

        Long currentUserId = getCurrentUserId();
        if (!event.getOrganizerId().equals(currentUserId)) {
            throw new Exception("You can only delete your own events");
        }

        eventRepository.delete(event);
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
        List<Event> events = eventRepository.findByOrganizerId(organizerId);
        User organizer = userRepository.findById(organizerId).orElse(null);
        String organizerName = organizer != null ? organizer.getName() : "Unknown";

        return events.stream()
                .map(event -> convertToResponse(event, organizerName))
                .collect(Collectors.toList());
    }

    @Override
    public List<Event> getAllEventsForAdmin() {
        return eventRepository.findAll();
    }

    @Override
    public Event getEventByIdForAdmin(Long id) {
        return eventRepository.findById(id).orElse(null);
    }

    @Override
    public Event updateEventAsAdmin(Long id, EventRequest eventData) {
        Event event = eventRepository.findById(id).orElse(null);
        if (event == null)
            return null;

        event.setTitle(eventData.getTitle());
        event.setDescription(eventData.getDescription());
        event.setDate(eventData.getDate());
        event.setTime(eventData.getTime());
        event.setState(eventData.getState());
        event.setCity(eventData.getCity());
        event.setAddress(eventData.getAddress());
        event.setLocation(eventData.getLocation());
        event.setCategory(eventData.getCategory());
        event.setImageUrl(eventData.getImageUrl());
        event.setMaxAttendees(eventData.getMaxAttendees());
        event.setEventType(eventData.getEventType());
        event.setPrivateCode(eventData.getPrivateCode());

        return eventRepository.save(event);
    }

    @Override
    public void deleteEventAsAdmin(Long id) {
        eventRepository.deleteById(id);
    }

    @Override
    public int getAttendeesCount(Long eventId) {
        Event event = eventRepository.findById(eventId).orElse(null);
        return event != null ? (event.getCurrentAttendees() != null ? event.getCurrentAttendees() : 0) : 0;
    }

    @Override
    public int getEventsCountByOrganizer(Long organizerId) {
        return eventRepository.countByOrganizerId(organizerId);
    }

    public Map<String, String> processValidationErrors(BindingResult bindingResult) {
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : bindingResult.getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        return errors;
    }

    public List<EventResponse> getMyEvents() throws Exception {
        Long currentUserId = getCurrentUserId();
        return getEventsByOrganizer(currentUserId);
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
        response.setDate(event.getDate());
        response.setTime(event.getTime());
        response.setLocation(event.getLocation());
        response.setState(event.getState());
        response.setCity(event.getCity());
        response.setAddress(event.getAddress());
        response.setCategory(event.getCategory());
        response.setImageUrl(event.getImageUrl());
        response.setOrganizerId(event.getOrganizerId());
        response.setOrganizerName(organizerName);
        response.setMaxAttendees(event.getMaxAttendees());
        response.setCurrentAttendees(event.getCurrentAttendees());
        response.setActive(event.isActive());
        response.setEventType(event.getEventType());
        response.setPrivateCode(event.getPrivateCode());
        response.setCreatedAt(event.getCreatedAt());
        response.setUpdatedAt(event.getUpdatedAt());

        return response;
    }
}