// AuthServiceImpl.java (REPLACE)
package com.eventzen.service.impl;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.eventzen.dto.request.LoginRequest;
import com.eventzen.dto.request.RegisterRequest;
import com.eventzen.dto.response.AuthResponse;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;
import com.eventzen.repository.UserRepository;
import com.eventzen.security.JwtService;
import com.eventzen.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse register(RegisterRequest request) throws Exception {
        System.out.println("Registration attempt for: " + request.getEmail());

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new Exception("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole() != null ? request.getRole() : Role.VISITOR);
        user.setMobileNumber(request.getMobileNumber());

        String imageUrl = request.getProfileImage();
        if (StringUtils.hasText(imageUrl)) {
            if (imageUrl.length() > 1000) {
                System.out
                        .println("Image URL too long, skipping for registration: " + imageUrl.length() + " characters");
                user.setImageUrl(null);
            } else {
                user.setImageUrl(imageUrl);
            }
        }

        System.out.println("Saving user to database...");
        userRepository.save(user);
        System.out.println("User saved successfully");

        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getEmail(), user.getRole(), "Registration successful");
    }

    @Override
    public AuthResponse login(LoginRequest request) throws Exception {
        System.out.println("Login attempt for: " + request.getEmail());

        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        if (optionalUser.isEmpty()) {
            throw new Exception("User not found");
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new Exception("Invalid password");
        }

        System.out.println("Password verified, generating token...");
        String token = jwtService.generateToken(user);

        return new AuthResponse(token, user.getEmail(), user.getRole(), "Login successful");
    }
}