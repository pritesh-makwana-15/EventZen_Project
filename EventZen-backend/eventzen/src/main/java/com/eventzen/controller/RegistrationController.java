// RegistrationController.java (REPLACE)
package com.eventzen.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
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

    @PostMapping
    public ResponseEntity<RegistrationResponse> register(@RequestBody RegistrationRequest request) {
        try {
            RegistrationResponse response = registrationService.registerForEvent(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get registrations by visitor
    @GetMapping("/visitor/{visitorId}")
    public ResponseEntity<List<RegistrationResponse>> getByVisitor(@PathVariable Long visitorId) {
        try {
            List<RegistrationResponse> registrations = registrationService.getRegistrationsByVisitor(visitorId);
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get registrations by event
    @GetMapping("/event/{eventId}")
    public ResponseEntity<List<RegistrationResponse>> getByEvent(@PathVariable Long eventId) {
        try {
            List<RegistrationResponse> registrations = registrationService.getRegistrationsByEvent(eventId);
            return ResponseEntity.ok(registrations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // CHANGED: DELETE endpoint instead of PUT for cancellation
    @DeleteMapping("/{registrationId}")
    public ResponseEntity<Void> cancelRegistration(@PathVariable Long registrationId) {
        try {
            registrationService.cancelRegistration(registrationId);
            return ResponseEntity.noContent().build(); // 204 No Content on success
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    // Keep old endpoint for backward compatibility (will be deprecated)
    @Deprecated
    @DeleteMapping("/cancel/{registrationId}")
    public ResponseEntity<Void> cancelRegistrationLegacy(@PathVariable Long registrationId) {
        try {
            registrationService.cancelRegistration(registrationId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }
}