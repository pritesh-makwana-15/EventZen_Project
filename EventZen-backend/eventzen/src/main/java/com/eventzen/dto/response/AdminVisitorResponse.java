// ================== AdminVisitorResponse.java ==================
package com.eventzen.dto.response;

import lombok.Data;

@Data
public class AdminVisitorResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private int registeredEventsCount;
}