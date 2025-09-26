// ================== EventService.java ==================
package com.eventzen.service;

import java.util.List;

import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.response.EventResponse;
import com.eventzen.entity.Event;

public interface EventService {

    // ===== EXISTING METHODS =====
    EventResponse createEvent(EventRequest request) throws Exception;

    EventResponse updateEvent(Long eventId, EventRequest request) throws Exception;

    void deleteEvent(Long eventId) throws Exception;

    EventResponse getEventById(Long eventId) throws Exception;

    List<EventResponse> getAllEvents();

    List<EventResponse> getEventsByOrganizer(Long organizerId);

    // ===== ADMIN METHODS =====
    List<Event> getAllEventsForAdmin();

    Event getEventByIdForAdmin(Long id);

    Event updateEventAsAdmin(Long id, EventRequest eventData);

    void deleteEventAsAdmin(Long id);

    int getAttendeesCount(Long eventId);

    int getEventsCountByOrganizer(Long organizerId);
}