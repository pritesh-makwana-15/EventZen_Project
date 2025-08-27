package com.eventzen.dto.response;

import java.time.LocalDateTime;

public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime date;
    private String location;
    private String category;
    private String imageUrl;
    private Long organizerId;

    public EventResponse(Long id, String title, String description, LocalDateTime date,
            String location, String category, String imageUrl, Long organizerId) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.date = date;
        this.location = location;
        this.category = category;
        this.imageUrl = imageUrl;
        this.organizerId = organizerId;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public String getLocation() {
        return location;
    }

    public String getCategory() {
        return category;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Long getOrganizerId() {
        return organizerId;
    }
}
