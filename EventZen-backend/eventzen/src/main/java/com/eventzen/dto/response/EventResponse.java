package com.eventzen.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

public class EventResponse {
    private Long id;
    private String title;
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime date;

    private String location;
    private String category;
    private String imageUrl;
    private Long organizerId;
    private String organizerName;

    // Additional fields from database schema
    private Integer maxAttendees;
    private Integer currentAttendees;
    private BigDecimal ticketPrice;
    private Boolean isActive;
    private String eventType;
    private String privateCode; // Only shown to organizer

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // Constructors
    public EventResponse() {
    }

    public EventResponse(Long id, String title, String description, LocalDateTime date,
            String location, String category, String imageUrl,
            Long organizerId, String organizerName,
            Integer maxAttendees, Integer currentAttendees,
            BigDecimal ticketPrice, Boolean isActive,
            String eventType, String privateCode,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
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
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Long getOrganizerId() {
        return organizerId;
    }

    public void setOrganizerId(Long organizerId) {
        this.organizerId = organizerId;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public Integer getMaxAttendees() {
        return maxAttendees;
    }

    public void setMaxAttendees(Integer maxAttendees) {
        this.maxAttendees = maxAttendees;
    }

    public Integer getCurrentAttendees() {
        return currentAttendees;
    }

    public void setCurrentAttendees(Integer currentAttendees) {
        this.currentAttendees = currentAttendees;
    }

    public BigDecimal getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(BigDecimal ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getPrivateCode() {
        return privateCode;
    }

    public void setPrivateCode(String privateCode) {
        this.privateCode = privateCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Utility methods for frontend
    public boolean isPrivate() {
        return "PRIVATE".equalsIgnoreCase(this.eventType);
    }

    public boolean isPublic() {
        return "PUBLIC".equalsIgnoreCase(this.eventType);
    }

    public boolean hasAvailableSpots() {
        if (maxAttendees == null)
            return true;
        return currentAttendees == null || currentAttendees < maxAttendees;
    }

    public int getAvailableSpots() {
        if (maxAttendees == null)
            return Integer.MAX_VALUE;
        return Math.max(0, maxAttendees - (currentAttendees != null ? currentAttendees : 0));
    }

    public boolean isUpcoming() {
        return date != null && date.isAfter(LocalDateTime.now());
    }

    public boolean isPast() {
        return date != null && date.isBefore(LocalDateTime.now());
    }

    // Create a public version (without private code for non-organizers)
    public EventResponse createPublicVersion() {
        EventResponse publicEvent = new EventResponse();
        publicEvent.setId(this.id);
        publicEvent.setTitle(this.title);
        publicEvent.setDescription(this.description);
        publicEvent.setDate(this.date);
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
        // Don't include privateCode in public version
        return publicEvent;
    }

    @Override
    public String toString() {
        return "EventResponse{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", date=" + date +
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