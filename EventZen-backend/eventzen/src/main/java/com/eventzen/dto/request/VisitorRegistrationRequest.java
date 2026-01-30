package com.eventzen.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 🆕 NEW: Request DTO for visitor event registration via form
 * Used when visitors register for events through the registration modal
 */
public class VisitorRegistrationRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    
    private String notes;
    
    private String privateCode; // Required for private events

    // Constructors
    public VisitorRegistrationRequest() {
    }

    public VisitorRegistrationRequest(String name, String email, String phone, String notes, String privateCode) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.notes = notes;
        this.privateCode = privateCode;
    }

    // Getters and Setters
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getPrivateCode() {
        return privateCode;
    }

    public void setPrivateCode(String privateCode) {
        this.privateCode = privateCode;
    }

    @Override
    public String toString() {
        return "VisitorRegistrationRequest{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", hasNotes=" + (notes != null && !notes.isEmpty()) +
                ", hasPrivateCode=" + (privateCode != null && !privateCode.isEmpty()) +
                '}';
    }
}