// EventResponse.java (REPLACE)
package com.eventzen.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class EventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime date;
    private String time;
    private String location;
    private String state;
    private String city;
    private String address;
    private String category;
    private String eventType;
    private String privateCode;
    private String imageUrl;
    private boolean active;
    private Integer maxAttendees;
    private Integer currentAttendees;
    private Long organizerId;
    private String organizerName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
