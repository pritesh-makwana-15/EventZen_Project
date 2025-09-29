// // =====================================
// // ProfileUpdateRequest.java
// // =====================================
// package com.eventzen.dto.request;

// public class ProfileUpdateRequest {
// private String name;
// private String email;
// private String password;
// private String mobileNumber;
// private String profileImage;

// // Constructors
// public ProfileUpdateRequest() {
// }

// public ProfileUpdateRequest(String name, String email, String password,
// String mobileNumber, String profileImage) {
// this.name = name;
// this.email = email;
// this.password = password;
// this.mobileNumber = mobileNumber;
// this.profileImage = profileImage;
// }

// // Getters and Setters
// public String getName() {
// return name;
// }

// public void setName(String name) {
// this.name = name;
// }

// public String getEmail() {
// return email;
// }

// public void setEmail(String email) {
// this.email = email;
// }

// public String getPassword() {
// return password;
// }

// public void setPassword(String password) {
// this.password = password;
// }

// public String getMobileNumber() {
// return mobileNumber;
// }

// public void setMobileNumber(String mobileNumber) {
// this.mobileNumber = mobileNumber;
// }

// public String getProfileImage() {
// return profileImage;
// }

// public void setProfileImage(String profileImage) {
// this.profileImage = profileImage;
// }

// @Override
// public String toString() {
// return "ProfileUpdateRequest{" +
// "name='" + name + '\'' +
// ", email='" + email + '\'' +
// ", mobileNumber='" + mobileNumber + '\'' +
// '}';
// }
// }


package com.eventzen.dto.request;

public class ProfileUpdateRequest {
    private String name;
    private String email;
    private String password;
    private String mobileNumber;
    private String imageUrl;

    // Constructors
    public ProfileUpdateRequest() {
    }

    public ProfileUpdateRequest(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    @Override
    public String toString() {
        return "ProfileUpdateRequest{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", mobileNumber='" + mobileNumber + '\'' +
                '}';
    }
}