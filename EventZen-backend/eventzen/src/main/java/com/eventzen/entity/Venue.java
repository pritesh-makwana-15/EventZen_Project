// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/entity/Venue.java
// 🆕 NEW: Venue entity for venue management
// ================================================================

package com.eventzen.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "venues")
public class Venue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "capacity")
    private Integer capacity = 0;

    // Store map data as JSON string
    @Column(name = "map_data", columnDefinition = "JSON")
    private String mapData;

    // Store unavailable dates as JSON string
    @Column(name = "unavailable_dates", columnDefinition = "JSON")
    private String unavailableDates;

    @Column(name = "image_url", length = 512)
    private String imageUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Automatically set timestamps
    @PrePersist
    protected void onCreate() {
        if (this.capacity == null) this.capacity = 0;
        if (this.isActive == null) this.isActive = true;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Venue() {}

    public Venue(String name, String address, String city, String state, Integer capacity) {
        this.name = name;
        this.address = address;
        this.city = city;
        this.state = state;
        this.capacity = capacity;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public String getMapData() { return mapData; }
    public void setMapData(String mapData) { this.mapData = mapData; }

    public String getUnavailableDates() { return unavailableDates; }
    public void setUnavailableDates(String unavailableDates) { this.unavailableDates = unavailableDates; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Utility methods for JSON handling
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public List<String> getUnavailableDatesList() {
        if (unavailableDates == null || unavailableDates.isEmpty()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(unavailableDates, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            return List.of();
        }
    }

    public void setUnavailableDatesList(List<String> dates) {
        try {
            this.unavailableDates = objectMapper.writeValueAsString(dates);
        } catch (JsonProcessingException e) {
            this.unavailableDates = "[]";
        }
    }

    // Get full location string
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

    @Override
    public String toString() {
        return "Venue{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", capacity=" + capacity +
                ", isActive=" + isActive +
                '}';
    }
}

// ================================================================
// USAGE NOTES:
// - mapData: Store as JSON string (e.g., SVG paths, coordinates)
// - unavailableDates: Store as JSON array of date strings
// - Use getUnavailableDatesList() to parse JSON into List<String>
// - Use setUnavailableDatesList() to convert List to JSON
// ================================================================