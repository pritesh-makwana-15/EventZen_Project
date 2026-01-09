// ================================================================
// FILE: VisitorController.java - FIXED
// Location: src/main/java/com/eventzen/controller/
// FIXES: Map.of() errors, exception handling, missing throws
// ================================================================

package com.eventzen.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.FeedbackRequest;
import com.eventzen.dto.response.EventCalendarResponse;
import com.eventzen.dto.response.TicketResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Feedback;
import com.eventzen.entity.Registration;
import com.eventzen.entity.Reminder;
import com.eventzen.entity.Ticket;
import com.eventzen.entity.User;
import com.eventzen.entity.Venue;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.FeedbackRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.TicketRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.repository.VenueRepository;
import com.eventzen.service.ReminderService;
import com.eventzen.service.TicketService;
import com.eventzen.service.impl.EventServiceImpl;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/visitor")
@PreAuthorize("hasRole('VISITOR')")
public class VisitorController {

    @Autowired
    private EventServiceImpl eventServiceImpl;
    @Autowired
    private RegistrationRepository registrationRepository;
    @Autowired
    private TicketRepository ticketRepository;
    @Autowired
    private TicketService ticketService;
    @Autowired
    private FeedbackRepository feedbackRepository;
    @Autowired
    private EventRepository eventRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ReminderService reminderService;
    @Autowired
    private VenueRepository venueRepository;

    // ================================================================
    // VISITOR CALENDAR
    // ================================================================

    @GetMapping("/calendar/events")
    public ResponseEntity<List<EventCalendarResponse>> getEventsForVisitorCalendar(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String to) {

        try {
            LocalDate startDate = LocalDate.parse(from);
            LocalDate endDate = LocalDate.parse(to);

            List<EventCalendarResponse> events = eventServiceImpl.getEventsForVisitorCalendar(startDate, endDate);
            return ResponseEntity.ok(events);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ================================================================
    // MY REGISTRATIONS
    // ================================================================

    @GetMapping("/registrations")
    public ResponseEntity<?> getMyRegistrations() {
        try {
            Long userId = getCurrentUserId();
            User visitor = userRepository.findById(userId)
                    .orElseThrow(() -> new Exception("User not found"));

            List<Registration> registrations = registrationRepository.findByVisitor(visitor);

            List<Map<String, Object>> response = registrations.stream().map(reg -> {
                Event event = reg.getEvent();

                // 🔧 FIX: Always query ticket, handle null safely
                Ticket ticket = ticketRepository.findByRegistrationId(reg.getId()).orElse(null);

                Map<String, Object> regMap = new HashMap<>();
                regMap.put("registrationId", reg.getId());
                regMap.put("eventId", event.getId());
                regMap.put("eventTitle", event.getTitle());
                regMap.put("eventDate", event.getStartDate().toString());
                regMap.put("eventTime", event.getStartTime() + " - " + event.getEndTime());
                regMap.put("eventLocation", event.getLocation() != null ? event.getLocation() : "N/A");
                regMap.put("status", reg.getStatus().toString());
                regMap.put("registeredAt", reg.getRegisteredAt().toString());

                // 🆕 CRITICAL: ALWAYS include these fields (never null)
                regMap.put("hasTicket", ticket != null);
                regMap.put("ticketId", ticket != null ? ticket.getId() : null);

                regMap.put("venueId", event.getVenueId() != null ? event.getVenueId() : null);
                regMap.put("category", event.getCategory() != null ? event.getCategory() : "General");

                return regMap;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ================================================================
    // TICKET DOWNLOAD
    // ================================================================

    @GetMapping("/tickets/{ticketId}/pdf")
    public ResponseEntity<?> downloadTicket(@PathVariable Long ticketId) {
        try {
            Long userId = getCurrentUserId();
            Ticket ticket = ticketService.getTicketById(ticketId);

            if (!ticket.getRegistration().getVisitor().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            byte[] pdf = ticketService.generateTicketPdf(ticketId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData(
                    "attachment", "ticket-" + ticket.getTicketCode() + ".pdf");

            return ResponseEntity.ok().headers(headers).body(pdf);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/tickets/{ticketId}")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long ticketId) {
        try {
            Long userId = getCurrentUserId();
            Ticket ticket = ticketService.getTicketById(ticketId);

            if (!ticket.getRegistration().getVisitor().getId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            TicketResponse response = convertToTicketResponse(ticket);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================================================================
    // FEEDBACK
    // ================================================================

    @PostMapping("/events/{eventId}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long eventId,
            @Valid @RequestBody FeedbackRequest request,
            BindingResult result) {

        try {
            if (result.hasErrors()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid feedback data"));
            }

            Long userId = getCurrentUserId();
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new Exception("User not found"));

            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new Exception("Event not found"));

            LocalDateTime eventEnd = LocalDateTime.of(event.getEndDate(), event.getEndTime());

            if (eventEnd.isAfter(LocalDateTime.now())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Feedback can only be submitted after the event ends"));
            }

            if (feedbackRepository.existsByEventIdAndUserId(eventId, userId)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "You have already submitted feedback for this event"));
            }

            Feedback feedback = new Feedback(event, user, request.getRating(), request.getComment());
            Feedback saved = feedbackRepository.save(feedback);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "id", saved.getId(),
                            "message", "Feedback submitted successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/events/{eventId}/feedback")
    public ResponseEntity<?> getEventFeedback(@PathVariable Long eventId) {
        try {
            List<Feedback> feedbacks = feedbackRepository.findByEventId(eventId);

            List<Map<String, Object>> response = feedbacks.stream()
                    .filter(f -> f.getIsReviewed() && !f.getIsFlagged())
                    .map(f -> {
                        Map<String, Object> feedbackMap = new HashMap<>();
                        feedbackMap.put("id", f.getId());
                        feedbackMap.put("userName", f.getUser().getName());
                        feedbackMap.put("rating", f.getRating());
                        feedbackMap.put("comment", f.getComment() != null ? f.getComment() : "");
                        feedbackMap.put("createdAt", f.getCreatedAt().toString());
                        return feedbackMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================================================================
    // REMINDERS
    // ================================================================

    @PostMapping("/reminders")
    public ResponseEntity<?> setReminder(@RequestBody Map<String, Long> request) {
        try {
            Long currentUserId = getCurrentUserId();
            Long eventId = request.get("eventId");

            if (eventId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Event ID is required"));
            }

            Reminder reminder = reminderService.createReminder(currentUserId, eventId);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "id", reminder.getId(),
                            "message", "Reminder set successfully"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/reminders")
    public ResponseEntity<?> getMyReminders() {
        try {
            Long currentUserId = getCurrentUserId();
            List<Reminder> reminders = reminderService.getRemindersByUserId(currentUserId);

            List<Map<String, Object>> response = reminders.stream()
                    .map(r -> {
                        Event event = r.getEvent();
                        Map<String, Object> reminderMap = new HashMap<>();
                        reminderMap.put("id", r.getId());
                        reminderMap.put("eventId", event.getId());
                        reminderMap.put("eventTitle", event.getTitle());
                        reminderMap.put("eventDate", event.getStartDate().toString());
                        reminderMap.put("eventTime", event.getStartTime().toString());
                        reminderMap.put("reminderSent", r.getReminderSent());
                        return reminderMap;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/reminders/{reminderId}")
    public ResponseEntity<?> deleteReminder(@PathVariable Long reminderId) {
        try {
            Long currentUserId = getCurrentUserId();
            reminderService.deleteReminder(reminderId, currentUserId);

            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================================================================
    // VENUE MAP
    // ================================================================

    @GetMapping("/venues/{venueId}")
    public ResponseEntity<?> getVenueDetails(@PathVariable Long venueId) {
        try {
            Venue venue = venueRepository.findById(venueId)
                    .orElseThrow(() -> new Exception("Venue not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("id", venue.getId());
            response.put("name", venue.getName());
            response.put("address", venue.getAddress() != null ? venue.getAddress() : "");
            response.put("city", venue.getCity() != null ? venue.getCity() : "");
            response.put("state", venue.getState() != null ? venue.getState() : "");
            response.put("description", venue.getDescription() != null ? venue.getDescription() : "");
            response.put("amenities", venue.getAmenities() != null ? venue.getAmenities() : "");
            response.put("capacity", venue.getCapacity());
            response.put("mapData", venue.getMapData() != null ? venue.getMapData() : "{}");
            response.put("imageUrl", venue.getImageUrl() != null ? venue.getImageUrl() : "");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ================================================================
    // HELPER METHODS
    // ================================================================

    private Long getCurrentUserId() throws Exception {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new Exception("User not authenticated");
        }

        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("User not found"));

        return user.getId();
    }

    private TicketResponse convertToTicketResponse(Ticket ticket) {
        Registration reg = ticket.getRegistration();
        Event event = reg.getEvent();
        User visitor = reg.getVisitor();

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        TicketResponse response = new TicketResponse();
        response.setId(ticket.getId());
        response.setRegistrationId(reg.getId());
        response.setTicketCode(ticket.getTicketCode());
        response.setIssuedAt(ticket.getIssuedAt());
        response.setIsCheckedIn(ticket.getIsCheckedIn());
        response.setCheckedInAt(ticket.getCheckedInAt());

        response.setEventId(event.getId());
        response.setEventTitle(event.getTitle());
        response.setEventDate(event.getStartDate().format(dateFormatter));
        response.setEventTime(event.getStartTime().format(timeFormatter) + " - "
                + event.getEndTime().format(timeFormatter));
        response.setEventLocation(event.getLocation());

        response.setVisitorId(visitor.getId());
        response.setVisitorName(visitor.getName());
        response.setVisitorEmail(visitor.getEmail());

        return response;
    }
}