package com.eventzen.dto.response;

import java.time.LocalDateTime;

import com.eventzen.entity.Role;

import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    // 🆕 ADDED: These fields for profile display
    private String mobileNumber;
    private String imageUrl;

    // Default Constructor
    public UserResponse() {
    }

    // Legacy Constructor (for backward compatibility)
    public UserResponse(Long id, String name, String email, String role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    // 🆕 NEW: Full Constructor with all fields
    public UserResponse(Long id, String name, String email, String role, 
                       String mobileNumber, String imageUrl) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.mobileNumber = mobileNumber;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    // 🆕 NEW: Getters and Setters for new fields
    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    @Override
    public String toString() {
        return "UserResponse{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", mobileNumber='" + mobileNumber + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                '}';
    }
}   