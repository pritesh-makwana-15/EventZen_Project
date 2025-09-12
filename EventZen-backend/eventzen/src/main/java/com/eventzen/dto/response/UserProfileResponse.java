// =====================================
// UserProfileResponse.java
// =====================================
package com.eventzen.dto.response;

public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private String role;
    private String mobileNumber;
    private String imageUrl;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long id, String name, String email, String role,
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
}