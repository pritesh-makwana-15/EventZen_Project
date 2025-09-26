// ================== UpdateProfileRequest.java ==================
package com.eventzen.dto.request;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String mobileNumber;
    private String profileImage;
}