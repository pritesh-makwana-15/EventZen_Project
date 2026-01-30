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
import com.eventzen.service.TicketService;

@Service
public class RegistrationServiceImpl implements RegistrationService {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private TicketService ticketService;

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

        // Step 4: PRIVATE EVENT CODE VALIDATION
        if ("PRIVATE".equalsIgnoreCase(event.getEventType())) {
            String providedCode = request.getPrivateCode();
            String actualCode = event.getPrivateCode();

            if (providedCode == null || providedCode.trim().isEmpty()) {
                throw new Exception("Private code is required for this event");
            }

            if (!providedCode.trim().equals(actualCode)) {
                throw new Exception("Private code is not correct");
            }
        }

        // Step 5: Prevent duplicate registrations (except CANCELLED)
        boolean alreadyRegistered = registrationRepository.findByVisitor(visitor)
                .stream()
                .anyMatch(reg -> reg.getEvent().getId().equals(event.getId())
                        && reg.getStatus() != RegistrationStatus.CANCELLED);

        if (alreadyRegistered) {
            throw new Exception("You are already registered for this event");
        }

        // Step 6: Capacity check
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
        registration.setStatus(RegistrationStatus.CONFIRMED);
        registration.setRegisteredAt(LocalDateTime.now());

        Registration saved = registrationRepository.save(registration);

        // Step 8: Update attendee count
        event.setCurrentAttendees(currentAttendees + 1);
        eventRepository.save(event);

        // Step 9: Auto-generate ticket (non-blocking)
        try {
            ticketService.generateTicket(saved);
            System.out.println("✅ Ticket generated for registration ID: " + saved.getId());
        } catch (Exception e) {
            System.err.println("⚠️ Ticket generation failed: " + e.getMessage());
            // Don't fail registration if ticket generation fails
        }

        System.out.println("✅ Registration successful - Status: " + saved.getStatus()
                + " - Attendees: " + event.getCurrentAttendees() + "/" + maxAttendees);
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
        System.out.println("=== CANCELLATION START ===");

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new Exception("Registration not found"));

        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new Exception("Registration is already cancelled");
        }

        Event event = registration.getEvent();
        Integer currentAttendees = event.getCurrentAttendees() != null
                ? event.getCurrentAttendees()
                : 0;

        registration.setStatus(RegistrationStatus.CANCELLED);
        registration.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(registration);

        if (currentAttendees > 0) {
            event.setCurrentAttendees(currentAttendees - 1);
            eventRepository.save(event);
        }

        System.out.println("✅ Registration cancelled");
        System.out.println("=== CANCELLATION END ===");
    }

    @Override
    public List<RegistrationResponse> getAllRegistrations() {
        return registrationRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * 🆕 UPDATED: Map Registration to Response with hasTicket field
     */
    private RegistrationResponse mapToResponse(Registration registration) {
        // Check if ticket exists for this registration
        boolean hasTicket = ticketService.hasTicket(registration.getId());

        // Get visitor details
        User visitor = registration.getVisitor();

        return new RegistrationResponse(
                registration.getId(),
                registration.getEvent().getId(),
                visitor.getId(),
                visitor.getName(),
                visitor.getEmail(),
                registration.getPhone(),
                registration.getStatus(),
                registration.getRegisteredAt(),
                registration.getNotes(),
                hasTicket // 🆕 NEW: Include ticket availability
        );
    }
}