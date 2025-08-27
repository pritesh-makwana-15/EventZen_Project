package com.eventzen.dto.request;

public class RegistrationRequest {
    private Long eventId;
    private Long visitorId; // will be set from JWT in real auth

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getVisitorId() { return visitorId; }
    public void setVisitorId(Long visitorId) { this.visitorId = visitorId; }
}
