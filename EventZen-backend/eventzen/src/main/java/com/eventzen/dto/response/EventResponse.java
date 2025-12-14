// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/dto/response/EventResponse.java
// 🆕 UPDATED: Added venue fields + separate start/end date & time
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

    // 🆕 Separate start date/time
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    // 🆕 Separate end date/time
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

    // 🆕 Venue details (NEW)
    private Long venueId;
    private String venueName;
    private String venueAddress;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime updatedAt;

    // ====================
    // Constructors
    // ====================

    public EventResponse() {
    }

    public EventResponse(
            Long id,
            String title,
            String description,
            LocalDate startDate,
            LocalTime startTime,
            LocalDate endDate,
            LocalTime endTime,
            String location,
            String category,
            String imageUrl,
            Long organizerId,
            String organizerName,
            Integer maxAttendees,
            Integer currentAttendees,
            BigDecimal ticketPrice,
            Boolean isActive,
            String eventType,
            String privateCode,
            Long venueId,
            String venueName,
            String venueAddress,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {
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
        this.venueId = venueId;
        this.venueName = venueName;
        this.venueAddress = venueAddress;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // ====================
    // Getters & Setters
    // ====================

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

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
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

    // 🆕 Venue getters/setters
    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getVenueAddress() {
        return venueAddress;
    }

    public void setVenueAddress(String venueAddress) {
        this.venueAddress = venueAddress;
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

    // ====================
    // Utility Methods
    // ====================

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
        if (startDate == null || startTime == null)
            return false;
        return LocalDateTime.of(startDate, startTime).isAfter(LocalDateTime.now());
    }

    public boolean isPast() {
        if (endDate == null || endTime == null)
            return false;
        return LocalDateTime.of(endDate, endTime).isBefore(LocalDateTime.now());
    }

    public boolean isOngoing() {
        if (startDate == null || startTime == null || endDate == null || endTime == null)
            return false;
        LocalDateTime now = LocalDateTime.now();
        return now.isAfter(LocalDateTime.of(startDate, startTime)) &&
                now.isBefore(LocalDateTime.of(endDate, endTime));
    }

    /**
     * Create public-safe response (removes privateCode)
     */
    public EventResponse createPublicVersion() {
        EventResponse e = new EventResponse();
        e.setId(id);
        e.setTitle(title);
        e.setDescription(description);
        e.setStartDate(startDate);
        e.setStartTime(startTime);
        e.setEndDate(endDate);
        e.setEndTime(endTime);
        e.setLocation(location);
        e.setCategory(category);
        e.setImageUrl(imageUrl);
        e.setOrganizerId(organizerId);
        e.setOrganizerName(organizerName);
        e.setMaxAttendees(maxAttendees);
        e.setCurrentAttendees(currentAttendees);
        e.setTicketPrice(ticketPrice);
        e.setIsActive(isActive);
        e.setEventType(eventType);
        e.setVenueId(venueId);
        e.setVenueName(venueName);
        e.setVenueAddress(venueAddress);
        e.setCreatedAt(createdAt);
        e.setUpdatedAt(updatedAt);
        return e;
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
                ", venueName='" + venueName + '\'' +
                ", category='" + category + '\'' +
                ", eventType='" + eventType + '\'' +
                ", isActive=" + isActive +
                '}';
    }
}
