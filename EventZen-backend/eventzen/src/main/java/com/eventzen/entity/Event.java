package com.eventzen.entity;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
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

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false)
    private LocalTime time;

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

    public Event(String title, String description, LocalDate date, LocalTime time,
                 String address, String category, Long organizerId) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
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

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public LocalTime getTime() { return time; }
    public void setTime(LocalTime time) { this.time = time; }

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

    // For backward compatibility with your existing location field
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

    public void setLocation(String location) {
        // Parse combined location back into components if needed
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
}