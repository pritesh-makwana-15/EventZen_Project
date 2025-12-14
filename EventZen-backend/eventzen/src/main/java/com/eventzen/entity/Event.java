// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/entity/Event.java
// 🆕 UPDATED: Separate start/end date & time fields + Venue relationship
// Summary:
//  - Replaced single 'date' with startDate, startTime, endDate, endTime
//  - Added Venue relationship (@ManyToOne) with helper getters
//  - Kept all utility methods (isOngoing/isUpcoming/hasEnded/etc.)
// ================================================================

package com.eventzen.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // 🆕 Separate date/time fields for start
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    // 🆕 Separate date/time fields for end
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    // Location fields
    private String state;
    private String city;
    private String address;

    @Column(name = "max_attendees")
    private Integer maxAttendees = 0;

    @Column(name = "current_attendees")
    private Integer currentAttendees = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "organizer_id", nullable = false)
    private Long organizerId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(length = 100)
    private String category;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "event_type", length = 20)
    private String eventType = "PUBLIC"; // PUBLIC or PRIVATE

    @Column(name = "private_code", length = 100)
    private String privateCode;

    // 🆕 NEW: Venue relationship (many events can reference one venue)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "venue_id")
    private Venue venue;

    // Automatically set timestamps
    @PrePersist
    protected void onCreate() {
        if (this.currentAttendees == null) this.currentAttendees = 0;
        if (this.isActive == null) this.isActive = true;
        if (this.eventType == null) this.eventType = "PUBLIC";
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Event() {}

    public Event(String title, String description, LocalDate startDate, LocalTime startTime,
                 LocalDate endDate, LocalTime endTime, String address, String category, Long organizerId) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.address = address;
        this.category = category;
        this.organizerId = organizerId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    // Start date/time
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    // End date/time
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getMaxAttendees() { return maxAttendees; }
    public void setMaxAttendees(Integer maxAttendees) { this.maxAttendees = maxAttendees; }

    public Integer getCurrentAttendees() { return currentAttendees; }
    public void setCurrentAttendees(Integer currentAttendees) { this.currentAttendees = currentAttendees; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public Long getOrganizerId() { return organizerId; }
    public void setOrganizerId(Long organizerId) { this.organizerId = organizerId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public String getPrivateCode() { return privateCode; }
    public void setPrivateCode(String privateCode) { this.privateCode = privateCode; }

    // 🆕 Venue getters/setters
    public Venue getVenue() { return venue; }
    public void setVenue(Venue venue) { this.venue = venue; }

    // Helper methods to expose venue info without loading it unnecessarily
    public Long getVenueId() {
        return venue != null ? venue.getId() : null;
    }

    public String getVenueName() {
        return venue != null ? venue.getName() : null;
    }

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

    // Combined location string (backward compatibility)
    public String getLocation() {
        StringBuilder location = new StringBuilder();
        if (address != null && !address.trim().isEmpty()) {
            location.append(address);
        }
        if (city != null && !city.trim().isEmpty()) {
            if (location.length() > 0) location.append(", ");
            location.append(city);
        }
        if (state != null && !state.trim().isEmpty()) {
            if (location.length() > 0) location.append(", ");
            location.append(state);
        }
        return location.toString();
    }

    // Parse combined location back into fields
    public void setLocation(String location) {
        if (location != null) {
            String[] parts = location.split(", ");
            if (parts.length >= 3) {
                this.address = parts[0];
                this.city = parts[parts.length - 2];
                this.state = parts[parts.length - 1];
            } else if (parts.length == 2) {
                this.address = parts[0];
                this.city = parts[1];
            } else {
                this.address = location;
            }
        }
    }

    // Time checks
    public boolean isOngoing() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = LocalDateTime.of(startDate, startTime);
        LocalDateTime end = LocalDateTime.of(endDate, endTime);
        return now.isAfter(start) && now.isBefore(end);
    }

    public boolean isUpcoming() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime start = LocalDateTime.of(startDate, startTime);
        return start.isAfter(now);
    }

    public boolean hasEnded() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime end = LocalDateTime.of(endDate, endTime);
        return end.isBefore(now);
    }

    // Optionally override toString() for debugging (omit lazy-loaded venue details to avoid fetching)
    @Override
    public String toString() {
        return "Event{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", startDate=" + startDate +
                ", startTime=" + startTime +
                ", endDate=" + endDate +
                ", endTime=" + endTime +
                ", city='" + city + '\'' +
                ", address='" + address + '\'' +
                ", maxAttendees=" + maxAttendees +
                ", currentAttendees=" + currentAttendees +
                ", isActive=" + isActive +
                ", organizerId=" + organizerId +
                ", category='" + category + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", eventType='" + eventType + '\'' +
                ", venueId=" + (venue != null ? venue.getId() : null) +
                '}';
    }
}
