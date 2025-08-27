package com.eventzen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.ProfileUpdateRequest;
import com.eventzen.dto.response.UserResponse;
import com.eventzen.service.UserService;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserService userService;

    // Example: /api/user/1
    @GetMapping("/{id}")
    public UserResponse getProfile(@PathVariable Long id) throws Exception {
        return userService.getUserProfile(id);
    }

    @PutMapping("/{id}")
    public UserResponse updateProfile(@PathVariable Long id, @RequestBody ProfileUpdateRequest request) throws Exception {
        return userService.updateUserProfile(id, request);
    }
}
