// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/controller/OrganizerController.java
// 🆕 NEW FILE - Organizer-specific endpoints
// This separates organizer routes from main EventController
// ================================================================

package com.eventzen.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.response.EventResponse;
import com.eventzen.service.EventService;

@RestController
@RequestMapping("/api/organizer/events") // ✅ Correct base path
public class OrganizerController {

    @Autowired
    private EventService eventService;

    /**
     * Resubmit rejected event for admin review
     * POST /api/organizer/events/{eventId}/resubmit
     */
    @PostMapping("/{eventId}/resubmit")
    @PreAuthorize("hasRole('ORGANIZER')")
    public ResponseEntity<?> resubmitEvent(@PathVariable Long eventId) {
        try {
            System.out.println("Organizer resubmitting event ID: " + eventId);

            EventResponse resubmittedEvent = eventService.resubmitEvent(eventId);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Event resubmitted for review",
                    "event", resubmittedEvent));

        } catch (Exception e) {
            System.err.println("Error resubmitting event: " + e.getMessage());

            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(404)
                        .body(Map.of("success", false, "message", "Event not found"));
            }

            if (e.getMessage().contains("Only rejected events")) {
                return ResponseEntity.status(400)
                        .body(Map.of("success", false, "message", e.getMessage()));
            }

            if (e.getMessage().contains("only resubmit your own")) {
                return ResponseEntity.status(403)
                        .body(Map.of("success", false, "message", "Access denied"));
            }

            return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}

// ================================================================
// END OF FILE - OrganizerController.java
// ================================================================