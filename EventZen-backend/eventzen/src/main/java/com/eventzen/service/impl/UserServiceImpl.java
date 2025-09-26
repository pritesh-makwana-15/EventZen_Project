// UserServiceImpl.java (REPLACE)
package com.eventzen.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.eventzen.dto.request.ProfileUpdateRequest;
import com.eventzen.dto.response.UserResponse;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getUserProfile(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        return mapToResponse(user);
    }

    @Override
    public UserResponse updateUserProfile(Long userId, ProfileUpdateRequest request) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            user.setName(request.getName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            if (userRepository.findByEmail(request.getEmail().trim()).isPresent()) {
                throw new Exception("Email already exists");
            }
            user.setEmail(request.getEmail().trim());
        }

        if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
            user.setPhone(request.getPhone().trim());
        }

        if (request.getOrganization() != null && !request.getOrganization().trim().isEmpty()) {
            user.setOrganization(request.getOrganization().trim());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponse getUserById(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        return mapToResponse(user);
    }

    @Override
    public void deleteUser(Long userId) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new Exception("User not found"));
        userRepository.delete(user);
    }

    @Override
    public List<User> getAllOrganizers() {
        return userRepository.findByRole(Role.ORGANIZER);
    }

    @Override
    public List<User> getAllVisitors() {
        return userRepository.findByRole(Role.VISITOR);
    }

    @Override
    public User getOrganizerById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User getVisitorById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    @Override
    public User createOrganizer(User organizer) {
        organizer.setRole(Role.ORGANIZER);
        organizer.setActive(true);
        return userRepository.save(organizer);
    }

    @Override
    public User updateOrganizer(User organizer) {
        return userRepository.save(organizer);
    }

    @Override
    public User toggleOrganizerStatus(Long organizerId) {
        User organizer = userRepository.findById(organizerId).orElse(null);
        if (organizer != null) {
            organizer.setActive(!organizer.isActive());
            return userRepository.save(organizer);
        }
        return null;
    }

    @Override
    public void deleteOrganizerAsAdmin(Long organizerId) {
        userRepository.deleteById(organizerId);
    }

    @Override
    public void deleteVisitorAsAdmin(Long visitorId) {
        userRepository.deleteById(visitorId);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    @Override
    public Role getOrganizerRole() {
        return Role.ORGANIZER;
    }

    @Override
    public Role getVisitorRole() {
        return Role.VISITOR;
    }

    @Override
    public int getRegisteredEventsCount(Long userId) {
        return 0;
    }

    @Override
    public long countOrganizers() {
        return userRepository.countByRole(Role.ORGANIZER);
    }

    @Override
    public long countVisitors() {
        return userRepository.countByRole(Role.VISITOR);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setMobileNumber(user.getMobileNumber());
        response.setPhone(user.getPhone());
        response.setOrganization(user.getOrganization());
        response.setActive(user.isActive());
        response.setImageUrl(user.getImageUrl());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}