// UpdateOrganizerRequest.java (REPLACE)
package com.eventzen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateOrganizerRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @Size(max = 100, message = "Organization must not exceed 100 characters")
    private String organization;

    @Size(max = 255, message = "Image URL must not exceed 255 characters")
    private String imageUrl;
}