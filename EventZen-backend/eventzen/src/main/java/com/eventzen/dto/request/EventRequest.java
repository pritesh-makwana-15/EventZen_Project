// EventRequest.java (REPLACE)
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
    @Future(message = "Event date must be in the future")
    private LocalDateTime date;

    private String time;
    private String state;
    private String city;
    private String address;

    @NotBlank(message = "Location is required")
    private String location;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    private String eventType;
    private String privateCode;
    private Integer maxAttendees;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    private boolean active = true;
}