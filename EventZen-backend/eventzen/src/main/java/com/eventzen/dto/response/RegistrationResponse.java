package com.eventzen.dto.response;

import java.time.LocalDateTime;

public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private Long visitorId;
    private String status; // changed from RegistrationStatus to String
    private LocalDateTime registeredAt;

    public RegistrationResponse(Long id, Long eventId, Long visitorId, String status, LocalDateTime registeredAt) {
        this.id = id;
        this.eventId = eventId;
        this.visitorId = visitorId;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    public Long getId() {
        return id;
    }

    public Long getEventId() {
        return eventId;
    }

    public Long getVisitorId() {
        return visitorId;
    }

    public String getStatus() {
        return status;
    } // updated to String

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }
}
