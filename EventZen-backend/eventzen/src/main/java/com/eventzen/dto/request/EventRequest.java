// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/dto/request/EventRequest.java
// 🆕 UPDATED: Added separate startDate, endDate, startTime, endTime fields
// Changes: Frontend now sends 4 separate fields instead of 1 combined datetime
// ================================================================

package com.eventzen.dto.request;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EventRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    // 🆕 NEW: Separate start date/time fields
    @NotNull(message = "Start date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime startTime;

    // 🆕 NEW: Separate end date/time fields
    @NotNull(message = "End date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime endTime;

    private String state;
    private String city;

    @NotBlank(message = "Address is required")
    private String address;

    @Min(value = 1, message = "Max attendees must be at least 1")
    private Integer maxAttendees;

    @NotBlank(message = "Category is required")
    private String category;

    private String imageUrl;
    private String eventType = "PUBLIC"; // PUBLIC or PRIVATE
    private String privateCode;

    // Constructors
    public EventRequest() {
    }

    public EventRequest(String title, String description,
            LocalDate startDate, LocalTime startTime,
            LocalDate endDate, LocalTime endTime,
            String address, String category, String imageUrl,
            Integer maxAttendees, String eventType, String privateCode) {
        this.title = title;
        this.description = description;
        this.startDate = startDate;
        this.startTime = startTime;
        this.endDate = endDate;
        this.endTime = endTime;
        this.address = address;
        this.category = category;
        this.imageUrl = imageUrl;
        this.maxAttendees = maxAttendees;
        this.eventType = eventType;
        this.privateCode = privateCode;
    }

    // Getters and Setters
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

    // 🆕 NEW: Start date/time getters/setters
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

    // 🆕 NEW: End date/time getters/setters
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

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Integer getMaxAttendees() {
        return maxAttendees;
    }

    public void setMaxAttendees(Integer maxAttendees) {
        this.maxAttendees = maxAttendees;
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

    // 🆕 NEW: Enhanced validation method
    public boolean isValid() {
        if (title == null || title.trim().isEmpty())
            return false;
        if (description == null || description.trim().isEmpty())
            return false;
        if (startDate == null || startTime == null)
            return false;
        if (endDate == null || endTime == null)
            return false;
        if (address == null || address.trim().isEmpty())
            return false;
        if (category == null || category.trim().isEmpty())
            return false;

        // Start date must be today or future
        if (startDate.isBefore(LocalDate.now()))
            return false;

        // End must be after start
        if (endDate.isBefore(startDate))
            return false;
        if (endDate.equals(startDate) && !endTime.isAfter(startTime))
            return false;

        // If private event, must have private code
        if ("PRIVATE".equalsIgnoreCase(eventType) &&
                (privateCode == null || privateCode.trim().isEmpty())) {
            return false;
        }

        // Max attendees should be positive if provided
        if (maxAttendees != null && maxAttendees <= 0)
            return false;

        return true;
    }

    @Override
    public String toString() {
        return "EventRequest{" +
                "title='" + title + '\'' +
                ", startDate=" + startDate +
                ", startTime=" + startTime +
                ", endDate=" + endDate +
                ", endTime=" + endTime +
                ", address='" + address + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", category='" + category + '\'' +
                ", maxAttendees=" + maxAttendees +
                ", eventType='" + eventType + '\'' +
                '}';
    }
}