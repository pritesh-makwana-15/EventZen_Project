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

        /**
         * Register visitor for an event
         * Includes validation, capacity check, and attendee count increment
         */
        @Override
        @Transactional
        public RegistrationResponse registerForEvent(RegistrationRequest request) throws Exception {
                System.out.println("Registration request - Visitor ID: " + request.getVisitorId()
                                + ", Event ID: " + request.getEventId());

                // Step 1: Fetch visitor
                User visitor = userRepository.findById(request.getVisitorId())
                                .orElseThrow(() -> new Exception("Visitor not found"));

                // Step 2: Fetch event
                Event event = eventRepository.findById(request.getEventId())
                                .orElseThrow(() -> new Exception("Event not found"));

                // Step 3: Validate event is active
                if (event.getIsActive() == null || !event.getIsActive()) {
                        throw new Exception("This event is no longer active");
                }

                // Step 4: Check if already registered (excluding cancelled registrations)
                boolean alreadyRegistered = registrationRepository.findByVisitor(visitor)
                                .stream()
                                .anyMatch(reg -> reg.getEvent().getId().equals(event.getId())
                                                && reg.getStatus() != RegistrationStatus.CANCELLED);

                if (alreadyRegistered) {
                        throw new Exception("You are already registered for this event");
                }

                // Step 5: Check capacity limit
                Integer maxAttendees = event.getMaxAttendees();
                Integer currentAttendees = event.getCurrentAttendees() != null
                                ? event.getCurrentAttendees()
                                : 0;

                if (maxAttendees != null && currentAttendees >= maxAttendees) {
                        throw new Exception("Registration closed - maximum attendees reached");
                }

                // Step 6: Create registration
                Registration registration = new Registration();
                registration.setVisitor(visitor);
                registration.setEvent(event);
                registration.setStatus(RegistrationStatus.PENDING);
                registration.setRegisteredAt(LocalDateTime.now());

                Registration saved = registrationRepository.save(registration);

                // Step 7: Increment attendee count
                event.setCurrentAttendees(currentAttendees + 1);
                eventRepository.save(event);

                System.out.println("Registration successful - New attendee count: "
                                + event.getCurrentAttendees() + "/" + maxAttendees);

                return mapToResponse(saved);
        }

        /**
         * Get all registrations for a specific visitor
         */
        @Override
        public List<RegistrationResponse> getRegistrationsByVisitor(Long visitorId) throws Exception {
                User visitor = userRepository.findById(visitorId)
                                .orElseThrow(() -> new Exception("Visitor not found"));

                return registrationRepository.findByVisitor(visitor)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Get all registrations for a specific event
         */
        @Override
        public List<RegistrationResponse> getRegistrationsByEvent(Long eventId) throws Exception {
                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new Exception("Event not found"));

                return registrationRepository.findByEvent(event)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Cancel a registration
         * Decrements attendee count when cancelling
         */
        @Override
        @Transactional
        public void cancelRegistration(Long registrationId) throws Exception {
                System.out.println("Canceling registration ID: " + registrationId);

                Registration registration = registrationRepository.findById(registrationId)
                                .orElseThrow(() -> new Exception("Registration not found"));

                // Only process if registration is not already cancelled
                if (registration.getStatus() != RegistrationStatus.CANCELLED) {
                        // Mark as cancelled
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

                                System.out.println("Registration cancelled - New attendee count: "
                                                + event.getCurrentAttendees() + "/" + event.getMaxAttendees());
                        }
                } else {
                        System.out.println("Registration already cancelled");
                }
        }

        /**
         * Get all registrations (Admin only)
         */
        @Override
        public List<RegistrationResponse> getAllRegistrations() {
                return registrationRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        /**
         * Helper method to map Registration entity to RegistrationResponse DTO
         */
        private RegistrationResponse mapToResponse(Registration registration) {
                return new RegistrationResponse(
                                registration.getId(),
                                registration.getEvent().getId(),
                                registration.getVisitor().getId(),
                                registration.getStatus(),
                                registration.getRegisteredAt());
        }
}