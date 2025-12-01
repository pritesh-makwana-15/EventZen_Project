    package com.eventzen.service.impl;

    import java.util.List;
    import java.util.stream.Collectors;

    import org.springframework.beans.factory.annotation.Autowired;
    import org.springframework.dao.DataIntegrityViolationException;
    import org.springframework.security.crypto.password.PasswordEncoder;
    import org.springframework.stereotype.Service;
    import org.springframework.transaction.annotation.Transactional;

    import com.eventzen.dto.request.ProfileUpdateRequest;
    import com.eventzen.dto.response.UserResponse;
    import com.eventzen.entity.Role;
    import com.eventzen.entity.User;
    import com.eventzen.repository.EventRepository;
    import com.eventzen.repository.RegistrationRepository;
    import com.eventzen.repository.UserRepository;
    import com.eventzen.service.UserService;

    @Service
    public class UserServiceImpl implements UserService {

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;
        
        @Autowired
        private EventRepository eventRepository;
        
        @Autowired
        private RegistrationRepository registrationRepository;

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
                user.setEmail(request.getEmail().trim());
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
        @Transactional
        public void deleteUser(Long userId) throws Exception {
            System.out.println("===========================================");
            System.out.println("=== DELETE USER START ===");
            System.out.println("===========================================");
            System.out.println("Deleting user with ID: " + userId);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new Exception("User not found"));

            System.out.println("User found: " + user.getName());
            System.out.println("User role: " + user.getRole());

            try {
                if (user.getRole() == Role.ORGANIZER) {
                    System.out.println(">>> USER IS ORGANIZER - Starting cascade deletion...");
                    
                    long eventCount = eventRepository.countByOrganizerId(userId);
                    System.out.println("📊 Organizer has " + eventCount + " events");
                    
                    if (eventCount > 0) {
                        List<Long> eventIds = eventRepository.findByOrganizerId(userId)
                                .stream() 
                                .map(event -> event.getId())
                                .collect(Collectors.toList());
                        
                        System.out.println("📋 Event IDs to delete: " + eventIds);
                        
                        long totalRegistrationsDeleted = 0;
                        for (Long eventId : eventIds) {
                            long regCount = registrationRepository.countByEventId(eventId);
                            if (regCount > 0) {
                                System.out.println("🗑️  Deleting " + regCount + " registrations for event ID: " + eventId);
                                registrationRepository.deleteByEventId(eventId);
                                totalRegistrationsDeleted += regCount;
                                System.out.println("✅ Registrations deleted for event ID: " + eventId);
                            }
                        }
                        
                        System.out.println("📊 Total registrations deleted: " + totalRegistrationsDeleted);
                        
                        System.out.println("🗑️  Deleting " + eventCount + " events for organizer ID: " + userId);
                        eventRepository.deleteByOrganizerId(userId);
                        System.out.println("✅ All events deleted for organizer ID: " + userId);
                    }
                    
                    System.out.println(">>> ORGANIZER cascade deletion complete");
                    
                } else if (user.getRole() == Role.VISITOR) {
                    System.out.println(">>> USER IS VISITOR - Deleting registrations...");
                    
                    long registrationCount = registrationRepository.countByUserId(userId);
                    System.out.println("📊 Visitor has " + registrationCount + " registrations");
                    
                    if (registrationCount > 0) {
                        System.out.println("🗑️  Deleting " + registrationCount + " registrations for visitor ID: " + userId);
                        registrationRepository.deleteByUserId(userId);
                        System.out.println("✅ All registrations deleted for visitor ID: " + userId);
                    }
                    
                    System.out.println(">>> VISITOR cascade deletion complete");
                    
                } else if (user.getRole() == Role.ADMIN) {
                    System.out.println(">>> USER IS ADMIN - No cascade deletion needed");
                }
                
                System.out.println("🗑️  Deleting user: " + user.getName() + " (ID: " + userId + ")");
                userRepository.delete(user);
                System.out.println("✅ User deleted successfully");
                
                System.out.println("===========================================");
                System.out.println("=== DELETE USER END (SUCCESS) ===");
                System.out.println("===========================================");
                
            } catch (DataIntegrityViolationException e) {
                System.err.println("===========================================");
                System.err.println("❌ FK CONSTRAINT ERROR DURING USER DELETION");
                System.err.println("===========================================");
                System.err.println("Error message: " + e.getMessage());
                System.err.println("Most specific cause: " + e.getMostSpecificCause().getMessage());
                e.printStackTrace();
                System.err.println("===========================================");
                throw new Exception("Cannot delete user due to database constraint. Please contact support.");
                
            } catch (Exception e) {
                System.err.println("===========================================");
                System.err.println("❌ ERROR DURING USER DELETION");
                System.err.println("===========================================");
                System.err.println("Error message: " + e.getMessage());
                e.printStackTrace();
                System.err.println("===========================================");
                throw e;
            }
        }

        private UserResponse mapToResponse(User user) {
            return new UserResponse(
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name()
            );
        }
    }