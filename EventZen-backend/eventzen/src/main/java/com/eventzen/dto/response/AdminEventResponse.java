// ================== AdminEventResponse.java ==================
package com.eventzen.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminEventResponse {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime date;
    private String location;
    private String category;
    private String imageUrl;
    private boolean active;
    private LocalDateTime createdAt;
    private OrganizerInfo organizer;
    private int attendeesCount;

    @Data
    public static class OrganizerInfo {
        private Long id;
        private String name;
    }
}