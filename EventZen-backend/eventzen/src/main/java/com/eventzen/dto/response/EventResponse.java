// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/dto/response/EventResponse.java
// 🆕 UPDATED: Added separate startDate, endDate, startTime, endTime fields
// Changes: Frontend receives 4 separate fields for better display control
// ================================================================

package com.eventzen.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class EventResponse {
    private Long id;
    private String title;
    private String description;

    // 🆕 NEW: Separate start date/time fields
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    // 🆕 NEW: Separate end date/time fields
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String location;
    private String category;
    private String imageUrl;
    private Long organizerId;
    private String organizerName;

    private Integer maxAttendees;
    private Integer currentAttendees;
    private BigDecimal ticketPrice;
    private Boolean isActive;
    private String eventType;
    private String privateCode;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Constructors
    public EventResponse() {}

    public EventResponse(Long id, String title, String description,
                        LocalDate startDate, LocalTime startTime,
                        LocalDate endDate, LocalTime endTime,
                        String location, String category, String imageUrl,
                        Long organizerId, String organizerName,
                        Integer maxAttendees, Integer currentAttendees,
                        BigDecimal ticketPrice, Boolean isActive,
                        String eventType, String privateCode,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.location = location;
        this.category = category;
        this.imageUrl = imageUrl;
        this.organizerId = organizerId;
        this.organizerName = organizerName;
        this.maxAttendees = maxAttendees;
        this.currentAttendees = currentAttendees;
        this.ticketPrice = ticketPrice;
        this.isActive = isActive;
        this.eventType = eventType;
        this.privateCode = privateCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // 🆕 NEW: Start date/time getters/setters
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    // 🆕 NEW: End date/time getters/setters
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    public String getOrganizerName() { return organizerName; }
    public void setOrganizerName(String organizerName) { this.organizerName = organizerName; }

    public Integer getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(Integer maxAttendees) { this.maxAttendees = maxAttendees; }

    public Integer getCurrentAttendees() { return currentAttendees; }
    public void setCurrentAttendees(Integer currentAttendees) { this.currentAttendees = currentAttendees; }

    public BigDecimal getTicketPrice() { return ticketPrice; }
    public void setTicketPrice(BigDecimal ticketPrice) { this.ticketPrice = ticketPrice; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPrivateCode() { return privateCode; }
    public void setPrivateCode(String privateCode) { this.privateCode = privateCode; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Utility methods
    public boolean isPrivate() {
        return "PRIVATE".equalsIgnoreCase(this.eventType);
    }

    public boolean isPublic() {
        return "PUBLIC".equalsIgnoreCase(this.eventType);
    }

    public boolean hasAvailableSpots() {
        if (maxAttendees == null) return true;
        return currentAttendees == null || currentAttendees < maxAttendees;
    }

    public int getAvailableSpots() {
        if (maxAttendees == null) return Integer.MAX_VALUE;
        return Math.max(0, maxAttendees - (currentAttendees != null ? currentAttendees : 0));
    }

    // 🆕 NEW: Check if event is upcoming
    public boolean isUpcoming() {
        if (startDate == null || startTime == null) return false;
        LocalDateTime start = LocalDateTime.of(startDate, startTime);
        return start.isAfter(LocalDateTime.now());
    }

    // 🆕 NEW: Check if event has ended
    public boolean isPast() {
        if (endDate == null || endTime == null) return false;
        LocalDateTime end = LocalDateTime.of(endDate, endTime);
        return end.isBefore(LocalDateTime.now());
    }

    // 🆕 NEW: Check if event is currently happening
    public boolean isOngoing() {
        if (startDate == null || startTime == null || endDate == null || endTime == null) return false;
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = LocalDateTime.of(startDate, startTime);
        LocalDateTime end = LocalDateTime.of(endDate, endTime);
        return now.isAfter(start) && now.isBefore(end);
    }

    // Create a public version (without private code)
    public EventResponse createPublicVersion() {
        EventResponse publicEvent = new EventResponse();
        publicEvent.setId(this.id);
        publicEvent.setTitle(this.title);
        publicEvent.setDescription(this.description);
        publicEvent.setStartDate(this.startDate);
        publicEvent.setStartTime(this.startTime);
        publicEvent.setEndDate(this.endDate);
        publicEvent.setEndTime(this.endTime);
        publicEvent.setLocation(this.location);
        publicEvent.setCategory(this.category);
        publicEvent.setImageUrl(this.imageUrl);
        publicEvent.setOrganizerId(this.organizerId);
        publicEvent.setOrganizerName(this.organizerName);
        publicEvent.setMaxAttendees(this.maxAttendees);
        publicEvent.setCurrentAttendees(this.currentAttendees);
        publicEvent.setTicketPrice(this.ticketPrice);
        publicEvent.setIsActive(this.isActive);
        publicEvent.setEventType(this.eventType);
        publicEvent.setCreatedAt(this.createdAt);
        publicEvent.setUpdatedAt(this.updatedAt);
        return publicEvent;
    }

    @Override
    public String toString() {
        return "EventResponse{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", startDate=" + startDate +
                ", startTime=" + startTime +
                ", endDate=" + endDate +
                ", endTime=" + endTime +
                ", location='" + location + '\'' +
                ", category='" + category + '\'' +
                ", organizerName='" + organizerName + '\'' +
                ", maxAttendees=" + maxAttendees +
                ", currentAttendees=" + currentAttendees +
                ", eventType='" + eventType + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}