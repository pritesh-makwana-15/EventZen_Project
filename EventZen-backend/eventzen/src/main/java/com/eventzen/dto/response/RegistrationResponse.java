package com.eventzen.dto.response;

import java.time.LocalDateTime;

import com.eventzen.entity.RegistrationStatus;

public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private Long visitorId;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;

    public RegistrationResponse(Long id, Long eventId, Long visitorId, RegistrationStatus status, LocalDateTime registeredAt) {
        this.id = id;
        this.eventId = eventId;
        this.visitorId = visitorId;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    // Getters
    public Long getId() { return id; }
    public Long getEventId() { return eventId; }
    public Long getVisitorId() { return visitorId; }
    public RegistrationStatus getStatus() { return status; }
    public LocalDateTime getRegisteredAt() { return registeredAt; }
}
