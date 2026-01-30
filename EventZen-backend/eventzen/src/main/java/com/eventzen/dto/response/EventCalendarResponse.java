// ================================================================
// FILE: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\dto\response\EventCalendarResponse.java
// 🆕 NEW FILE - Calendar-specific response DTO
// ================================================================

package com.eventzen.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public class EventCalendarResponse {
    private Long id;
    private String title;
    private LocalDate startDate;
    private LocalTime startTime;
    private LocalDate endDate;
    private LocalTime endTime;
    private String category;
    private String color;
    private String organizerName;
    private Boolean isPublic;
    private String registrationStatus; // CONFIRMED, WAITLIST, CANCELLED, NONE
    private Integer registrationCount;
    private Integer capacity;
    private String status; // UPCOMING or COMPLETED
    private String location;
    private String description;
    private String imageUrl;

    // Constructors
    public EventCalendarResponse() {
    }

    public EventCalendarResponse(Long id, String title, LocalDate startDate, LocalTime startTime,
            LocalDate endDate, LocalTime endTime, String category, String color,
            String organizerName, Boolean isPublic, String registrationStatus,
            Integer registrationCount, Integer capacity, String status) {
        this.id = id;
        this.title = title;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.category = category;
        this.color = color;
        this.organizerName = organizerName;
        this.isPublic = isPublic;
        this.registrationStatus = registrationStatus;
        this.registrationCount = registrationCount;
        this.capacity = capacity;
        this.status = status;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getOrganizerName() {
        return organizerName;
    }

    public void setOrganizerName(String organizerName) {
        this.organizerName = organizerName;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public String getRegistrationStatus() {
        return registrationStatus;
    }

    public void setRegistrationStatus(String registrationStatus) {
        this.registrationStatus = registrationStatus;
    }

    public Integer getRegistrationCount() {
        return registrationCount;
    }

    public void setRegistrationCount(Integer registrationCount) {
        this.registrationCount = registrationCount;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
}