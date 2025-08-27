package com.eventzen.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.RegistrationRequest;
import com.eventzen.dto.response.RegistrationResponse;
import com.eventzen.service.RegistrationService;

@RestController
@RequestMapping("/api/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService registrationService;

    // Visitor registers for an event
    @PostMapping
    public RegistrationResponse register(@RequestBody RegistrationRequest request) throws Exception {
        return registrationService.registerForEvent(request);
    }

    // Get registrations by visitor
    @GetMapping("/visitor/{visitorId}")
    public List<RegistrationResponse> getByVisitor(@PathVariable Long visitorId) throws Exception {
        return registrationService.getRegistrationsByVisitor(visitorId);
    }

    // Get registrations by event
    @GetMapping("/event/{eventId}")
    public List<RegistrationResponse> getByEvent(@PathVariable Long eventId) throws Exception {
        return registrationService.getRegistrationsByEvent(eventId);
    }

    // Cancel a registration
    @PutMapping("/cancel/{registrationId}")
    public void cancelRegistration(@PathVariable Long registrationId) throws Exception {
        registrationService.cancelRegistration(registrationId);
    }
}
