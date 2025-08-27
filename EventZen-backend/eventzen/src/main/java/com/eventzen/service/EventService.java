package com.eventzen.service;

import java.util.List;

import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.response.EventResponse;

public interface EventService {
    EventResponse createEvent(EventRequest request) throws Exception;
    EventResponse updateEvent(Long eventId, EventRequest request) throws Exception;
    void deleteEvent(Long eventId) throws Exception;
    EventResponse getEventById(Long eventId) throws Exception;
    List<EventResponse> getAllEvents();
    List<EventResponse> getEventsByOrganizer(Long organizerId);
}
