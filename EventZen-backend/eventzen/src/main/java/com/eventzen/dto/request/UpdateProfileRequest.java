// =====================================
// UpdateProfileRequest.java
// =====================================

package com.eventzen.dto.request;

public class UpdateProfileRequest {
    private String name;
    private String mobileNumber;
    private String profileImage;

    // Constructors
    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String name, String mobileNumber, String profileImage) {
        this.name = name;
        this.mobileNumber = mobileNumber;
        this.profileImage = profileImage;
    }

    // Getters and Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMobileNumber() {
        return mobileNumber;
    }

    public void setMobileNumber(String mobileNumber) {
        this.mobileNumber = mobileNumber;
    }

    public String getProfileImage() {
        return profileImage;
    }

    public void setProfileImage(String profileImage) {
        this.profileImage = profileImage;
    }
}