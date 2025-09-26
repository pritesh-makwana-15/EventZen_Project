package com.eventzen.dto.request;

import lombok.Data;

@Data
public class RegistrationRequest {
    private Long eventId;
    private Long visitorId;
}