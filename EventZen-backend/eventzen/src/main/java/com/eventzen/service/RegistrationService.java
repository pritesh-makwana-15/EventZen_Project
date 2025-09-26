// ================== RegistrationService.java ==================
package com.eventzen.service;

import java.util.List;

import com.eventzen.dto.request.RegistrationRequest;
import com.eventzen.dto.response.RegistrationResponse;

public interface RegistrationService {

    // Method signatures that match your controller usage
    RegistrationResponse registerForEvent(RegistrationRequest request) throws Exception;

    List<RegistrationResponse> getRegistrationsByVisitor(Long visitorId) throws Exception;

    List<RegistrationResponse> getRegistrationsByEvent(Long eventId) throws Exception;

    // Existing methods
    List<RegistrationResponse> getAllRegistrations();

    void cancelRegistration(Long registrationId) throws Exception;
}