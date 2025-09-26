// RegistrationResponse.java (REPLACE)
package com.eventzen.dto.response;

import java.time.LocalDateTime;

import com.eventzen.entity.RegistrationStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponse {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private Long visitorId;
    private String visitorName;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
}
    