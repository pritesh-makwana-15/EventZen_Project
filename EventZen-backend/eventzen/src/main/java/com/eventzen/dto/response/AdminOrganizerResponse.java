// ================== AdminOrganizerResponse.java ==================
package com.eventzen.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AdminOrganizerResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String organization;
    private boolean active;
    private LocalDateTime createdAt;
    private int eventsCreated;
}