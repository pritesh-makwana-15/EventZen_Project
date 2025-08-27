package com.eventzen.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.response.EventResponse;
import com.eventzen.dto.response.RegistrationResponse;
import com.eventzen.dto.response.UserResponse;
import com.eventzen.service.EventService;
import com.eventzen.service.RegistrationService;
import com.eventzen.service.UserService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private EventService eventService;

    @Autowired
    private RegistrationService registrationService;

    // 1️⃣ Get all users
    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    // 2️⃣ Get user by ID
    @GetMapping("/users/{id}")
    public UserResponse getUserById(@PathVariable Long id) throws Exception {
        return userService.getUserById(id);
    }

    // 3️⃣ Delete user
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) throws Exception {
        userService.deleteUser(id);
    }

    // 4️⃣ Get all events
    @GetMapping("/events")
    public List<EventResponse> getAllEvents() {
        return eventService.getAllEvents();
    }

    // 5️⃣ Get all registrations
    @GetMapping("/registrations")
    public List<RegistrationResponse> getAllRegistrations() {
        return registrationService.getAllRegistrations();
    }

    // 6️⃣ Cancel any registration
    @PutMapping("/registrations/cancel/{registrationId}")
    public void cancelRegistration(@PathVariable Long registrationId) throws Exception {
        registrationService.cancelRegistration(registrationId);
    }
}
