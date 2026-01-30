// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/dto/request/EventRequest.java
// 🆕 UPDATED: Added venueId + separate start/end date & time fields
// ================================================================

package com.eventzen.dto.request;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class EventRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    @NotNull(message = "Time is required")
    @JsonFormat(pattern = "HH:mm")
    private LocalTime time;

    private String state;
    private String city;
    private String address;

    @NotBlank(message = "Location is required")
    private String location;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    private String imageUrl;
    private String eventType = "PUBLIC"; // PUBLIC or PRIVATE
    private String privateCode;

    // Constructors
    public EventRequest() {
    }

    public EventRequest(String title, String description, LocalDate date, LocalTime time,
            String address, String category, String imageUrl,
            Integer maxAttendees, String eventType, String privateCode) {
        this.title = title;
        this.description = description;
        this.date = date;
        this.time = time;
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

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalTime getTime() {
        return time;
    }

    public void setTime(LocalTime time) {
        this.time = time;
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

    // Validation method
    public boolean isValid() {
        if (title == null || title.trim().isEmpty())
            return false;
        if (description == null || description.trim().isEmpty())
            return false;
        if (date == null)
            return false;
        if (time == null)
            return false;
        if (address == null || address.trim().isEmpty())
            return false;
        if (category == null || category.trim().isEmpty())
            return false;

        // Date must be today or future
        if (date.isBefore(LocalDate.now()))
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
                ", date=" + date +
                ", time=" + time +
                ", address='" + address + '\'' +
                ", city='" + city + '\'' +
                ", state='" + state + '\'' +
                ", category='" + category + '\'' +
                ", maxAttendees=" + maxAttendees +
                ", eventType='" + eventType + '\'' +
                '}';
    }
}
