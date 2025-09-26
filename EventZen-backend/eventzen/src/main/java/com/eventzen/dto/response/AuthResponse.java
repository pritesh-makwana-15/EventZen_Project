// ================== AuthResponse.java ==================
package com.eventzen.dto.response;

import com.eventzen.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String email;
    private Role role;
    private String message;
}