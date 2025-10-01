package com.eventzen.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.dto.request.RegistrationRequest;
import com.eventzen.dto.response.RegistrationResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.RegistrationStatus;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.RegistrationService;

@Service
public class RegistrationServiceImpl implements RegistrationService {

        @Autowired
        private RegistrationRepository registrationRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private EventRepository eventRepository;

        @Override
        @Transactional
        public RegistrationResponse registerForEvent(RegistrationRequest request) throws Exception {
                System.out.println("=== REGISTRATION START ===");
                System.out.println("Visitor ID: " + request.getVisitorId());
                System.out.println("Event ID: " + request.getEventId());
                System.out.println("Provided Private Code: " + request.getPrivateCode());

                // Step 1: Fetch visitor
                User visitor = userRepository.findById(request.getVisitorId())
                                .orElseThrow(() -> new Exception("Visitor not found"));

                // Step 2: Fetch event
                Event event = eventRepository.findById(request.getEventId())
                                .orElseThrow(() -> new Exception("Event not found"));

                System.out.println("Event Type: " + event.getEventType());
                System.out.println("Event Private Code: " + event.getPrivateCode());

                // Step 3: Validate event is active
                if (event.getIsActive() == null || !event.getIsActive()) {
                        throw new Exception("This event is no longer active");
                }

                // Step 4: VALIDATE PRIVATE EVENT CODE (CRITICAL CHECK)
                if ("PRIVATE".equalsIgnoreCase(event.getEventType())) {
                        String providedCode = request.getPrivateCode();
                        String actualCode = event.getPrivateCode();

                        System.out.println("Private event detected!");
                        System.out.println("Provided code: '" + providedCode + "'");
                        System.out.println("Actual code: '" + actualCode + "'");

                        // Check if code was provided
                        if (providedCode == null || providedCode.trim().isEmpty()) {
                                System.out.println("ERROR: No private code provided");
                                throw new Exception("Private code is required for this event");
                        }

                        // Check if code matches
                        if (!providedCode.trim().equals(actualCode)) {
                                System.out.println("ERROR: Private code does not match");
                                throw new Exception("Private code is not correct");
                        }

                        System.out.println("SUCCESS: Private code validated");
                }

                // Step 5: Check if already registered
                boolean alreadyRegistered = registrationRepository.findByVisitor(visitor)
                                .stream()
                                .anyMatch(reg -> reg.getEvent().getId().equals(event.getId())
                                                && reg.getStatus() != RegistrationStatus.CANCELLED);

                if (alreadyRegistered) {
                        throw new Exception("You are already registered for this event");
                }

                // Step 6: Check capacity limit
                Integer maxAttendees = event.getMaxAttendees();
                Integer currentAttendees = event.getCurrentAttendees() != null
                                ? event.getCurrentAttendees()
                                : 0;

                if (maxAttendees != null && currentAttendees >= maxAttendees) {
                        throw new Exception("Registration closed - maximum attendees reached");
                }

                // Step 7: Create registration
                Registration registration = new Registration();
                registration.setVisitor(visitor);
                registration.setEvent(event);
                registration.setStatus(RegistrationStatus.PENDING);
                registration.setRegisteredAt(LocalDateTime.now());

                Registration saved = registrationRepository.save(registration);

                // Step 8: Increment attendee count
                event.setCurrentAttendees(currentAttendees + 1);
                eventRepository.save(event);

                System.out.println("Registration successful - Attendee count: "
                                + event.getCurrentAttendees() + "/" + maxAttendees);
                System.out.println("=== REGISTRATION END ===");

                return mapToResponse(saved);
        }

        @Override
        public List<RegistrationResponse> getRegistrationsByVisitor(Long visitorId) throws Exception {
                User visitor = userRepository.findById(visitorId)
                                .orElseThrow(() -> new Exception("Visitor not found"));

                return registrationRepository.findByVisitor(visitor)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        public List<RegistrationResponse> getRegistrationsByEvent(Long eventId) throws Exception {
                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new Exception("Event not found"));

                return registrationRepository.findByEvent(event)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public void cancelRegistration(Long registrationId) throws Exception {
                System.out.println("Canceling registration ID: " + registrationId);

                Registration registration = registrationRepository.findById(registrationId)
                                .orElseThrow(() -> new Exception("Registration not found"));

                // Only process if registration is not already cancelled
                if (registration.getStatus() != RegistrationStatus.CANCELLED) {
                        registration.setStatus(RegistrationStatus.CANCELLED);
                        registrationRepository.save(registration);

                        // Decrement attendee count
                        Event event = registration.getEvent();
                        Integer currentAttendees = event.getCurrentAttendees() != null
                                        ? event.getCurrentAttendees()
                                        : 0;

                        if (currentAttendees > 0) {
                                event.setCurrentAttendees(currentAttendees - 1);
                                eventRepository.save(event);

                                System.out.println("Registration cancelled - Attendee count: "
                                                + event.getCurrentAttendees() + "/" + event.getMaxAttendees());
                        }
                } else {
                        System.out.println("Registration already cancelled");
                }
        }

        @Override
        public List<RegistrationResponse> getAllRegistrations() {
                return registrationRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        private RegistrationResponse mapToResponse(Registration registration) {
                return new RegistrationResponse(
                                registration.getId(),
                                registration.getEvent().getId(),
                                registration.getVisitor().getId(),
                                registration.getStatus(),
                                registration.getRegisteredAt());
        }
}