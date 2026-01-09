package com.eventzen.service;

import java.util.List;

import com.eventzen.dto.request.EventRequest;
import com.eventzen.dto.response.EventResponse;
import com.eventzen.entity.EventStatus;

public interface EventService {
    EventResponse createEvent(EventRequest request) throws Exception;

    EventResponse updateEvent(Long eventId, EventRequest request) throws Exception;

    void deleteEvent(Long eventId) throws Exception;

    EventResponse getEventById(Long eventId) throws Exception;

    List<EventResponse> getAllEvents();

    List<EventResponse> getEventsByOrganizer(Long organizerId);

    /**
     * Approve an event (Admin only)
     * Changes status from PENDING to APPROVED
     * 
     * @param eventId - ID of event to approve
     * @return Updated event response
     * @throws Exception if event not found or not in PENDING status
     */
    EventResponse approveEvent(Long eventId) throws Exception;

    /**
     * Reject an event with reason (Admin only)
     * Changes status from PENDING to REJECTED
     * 
     * @param eventId - ID of event to reject
     * @param reason  - Reason for rejection (shown to organizer)
     * @return Updated event response
     * @throws Exception if event not found or not in PENDING status
     */
    EventResponse rejectEvent(Long eventId, String reason) throws Exception;

    /**
     * Get all pending events (Admin only)
     * Returns events with status = PENDING
     * 
     * @return List of pending events
     */
    List<EventResponse> getPendingEvents();

    /**
     * Get all rejected events (Admin only)
     * Returns events with status = REJECTED
     * 
     * @return List of rejected events
     */
    List<EventResponse> getRejectedEvents();

    /**
     * Get all approved events (Public/Visitor)
     * Returns only events with status = APPROVED
     * 
     * @return List of approved events
     */
    List<EventResponse> getApprovedEvents();

    /**
     * Get events by status (Admin only)
     * 
     * @param status - EventStatus enum (PENDING, APPROVED, REJECTED)
     * @return List of events with specified status
     */
    List<EventResponse> getEventsByStatus(EventStatus status);

    /**
     * Get organizer's events by status
     * Used by organizer to filter their own events
     * 
     * @param organizerId - ID of organizer
     * @param status      - EventStatus enum
     * @return List of organizer's events with specified status
     */
    List<EventResponse> getOrganizerEventsByStatus(Long organizerId, EventStatus status);

    /**
     * Resubmit rejected event (Organizer only)
     * Changes status from REJECTED back to PENDING
     * Clears rejection reason
     * 
     * @param eventId - ID of rejected event
     * @return Updated event response
     * @throws Exception if event not found, not owned by organizer, or not REJECTED
     */
    EventResponse resubmitEvent(Long eventId) throws Exception;

    /**
     * Check if event is approved
     * Used for validation before allowing registrations
     * 
     * @param eventId - ID of event
     * @return true if event status is APPROVED
     */
    boolean isEventApproved(Long eventId);
}
