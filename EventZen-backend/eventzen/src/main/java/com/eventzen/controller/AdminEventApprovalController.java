// ================================================================
// FILE: AdminEventApprovalController.java
// Location: src/main/java/com/eventzen/controller/AdminEventApprovalController.java
// Purpose: Controller for admin event approval workflow
// ================================================================

package com.eventzen.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.request.EventApprovalRequest;
import com.eventzen.dto.response.EventResponse;
import com.eventzen.entity.EventStatus;
import com.eventzen.service.EventService;

import jakarta.validation.Valid;

/**
 * Admin Event Approval Controller
 * Handles event approval/rejection workflow
 * All endpoints require ADMIN role
 */
@RestController
@RequestMapping("/api/admin/events")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEventApprovalController {

    @Autowired
    private EventService eventService;

    // ================================================================
    // GET ALL PENDING EVENTS
    // ================================================================

    /**
     * Get all pending events awaiting approval
     * GET /api/admin/events/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<EventResponse>> getPendingEvents() {
        try {
            System.out.println("Admin fetching pending events");
            List<EventResponse> pendingEvents = eventService.getPendingEvents();
            return ResponseEntity.ok(pendingEvents);
        } catch (Exception e) {
            System.err.println("Error fetching pending events: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ================================================================
    // GET ALL REJECTED EVENTS
    // ================================================================

    /**
     * Get all rejected events
     * GET /api/admin/events/rejected
     */
    @GetMapping("/rejected")
    public ResponseEntity<List<EventResponse>> getRejectedEvents() {
        try {
            System.out.println("Admin fetching rejected events");
            List<EventResponse> rejectedEvents = eventService.getRejectedEvents();
            return ResponseEntity.ok(rejectedEvents);
        } catch (Exception e) {
            System.err.println("Error fetching rejected events: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ================================================================
    // GET ALL APPROVED EVENTS
    // ================================================================

    /**
     * Get all approved events
     * GET /api/admin/events/approved
     */
    @GetMapping("/approved")
    public ResponseEntity<List<EventResponse>> getApprovedEvents() {
        try {
            System.out.println("Admin fetching approved events");
            List<EventResponse> approvedEvents = eventService.getApprovedEvents();
            return ResponseEntity.ok(approvedEvents);
        } catch (Exception e) {
            System.err.println("Error fetching approved events: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // ================================================================
    // APPROVE EVENT
    // ================================================================

    /**
     * Approve a pending event
     * POST /api/admin/events/{eventId}/approve
     */
    @PostMapping("/{eventId}/approve")
    public ResponseEntity<?> approveEvent(@PathVariable Long eventId) {
        try {
            System.out.println("Admin approving event ID: " + eventId);
            EventResponse approvedEvent = eventService.approveEvent(eventId);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Event approved successfully",
                "event", approvedEvent
            ));
            
        } catch (Exception e) {
            System.err.println("Error approving event: " + e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(404)
                    .body(Map.of("success", false, "message", "Event not found"));
            }
            
            if (e.getMessage().contains("Only pending events")) {
                return ResponseEntity.status(400)
                    .body(Map.of("success", false, "message", e.getMessage()));
            }
            
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to approve event"));
        }
    }

    // ================================================================
    // REJECT EVENT
    // ================================================================

    /**
     * Reject a pending event with reason
     * POST /api/admin/events/{eventId}/reject
     * Body: { "rejectionReason": "Reason text" }
     */
    @PostMapping("/{eventId}/reject")
    public ResponseEntity<?> rejectEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody Map<String, String> request,
            BindingResult bindingResult) {
        
        try {
            if (bindingResult.hasErrors()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Validation failed"));
            }
            
            String rejectionReason = request.get("rejectionReason");
            
            if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Rejection reason is required"));
            }
            
            System.out.println("Admin rejecting event ID: " + eventId + " | Reason: " + rejectionReason);
            EventResponse rejectedEvent = eventService.rejectEvent(eventId, rejectionReason);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Event rejected successfully",
                "event", rejectedEvent
            ));
            
        } catch (Exception e) {
            System.err.println("Error rejecting event: " + e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(404)
                    .body(Map.of("success", false, "message", "Event not found"));
            }
            
            if (e.getMessage().contains("Only pending events")) {
                return ResponseEntity.status(400)
                    .body(Map.of("success", false, "message", e.getMessage()));
            }
            
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", "Failed to reject event"));
        }
    }

    // ================================================================
    // APPROVE/REJECT (COMBINED ENDPOINT - ALTERNATIVE)
    // ================================================================

    /**
     * Approve or reject event based on action
     * PUT /api/admin/events/{eventId}/review
     * Body: { "action": "APPROVE" } or { "action": "REJECT", "rejectionReason": "..." }
     */
    @PutMapping("/{eventId}/review")
    public ResponseEntity<?> reviewEvent(
            @PathVariable Long eventId,
            @Valid @RequestBody EventApprovalRequest request,
            BindingResult bindingResult) {
        
        try {
            if (bindingResult.hasErrors()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Validation failed"));
            }
            
            if (request.isApprove()) {
                System.out.println("Admin approving event ID: " + eventId);
                EventResponse approvedEvent = eventService.approveEvent(eventId);
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Event approved successfully",
                    "event", approvedEvent
                ));
                
            } else if (request.isReject()) {
                if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                    return ResponseEntity.badRequest()
                        .body(Map.of("success", false, "message", "Rejection reason is required"));
                }
                
                System.out.println("Admin rejecting event ID: " + eventId);
                EventResponse rejectedEvent = eventService.rejectEvent(eventId, request.getRejectionReason());
                
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Event rejected successfully",
                    "event", rejectedEvent
                ));
                
            } else {
                return ResponseEntity.badRequest()
                    .body(Map.of("success", false, "message", "Invalid action. Use APPROVE or REJECT"));
            }
            
        } catch (Exception e) {
            System.err.println("Error reviewing event: " + e.getMessage());
            
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(404)
                    .body(Map.of("success", false, "message", "Event not found"));
            }
            
            return ResponseEntity.status(500)
                .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ================================================================
    // GET EVENTS BY STATUS
    // ================================================================

    /**
     * Get events by status
     * GET /api/admin/events/status/{status}
     * status = PENDING, APPROVED, or REJECTED
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getEventsByStatus(@PathVariable String status) {
        try {
            EventStatus eventStatus = EventStatus.valueOf(status.toUpperCase());
            List<EventResponse> events = eventService.getEventsByStatus(eventStatus);
            return ResponseEntity.ok(events);
            
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("success", false, "message", "Invalid status. Use PENDING, APPROVED, or REJECTED"));
                
        } catch (Exception e) {
            System.err.println("Error fetching events by status: " + e.getMessage());
            return ResponseEntity.internalServerError()
                .body(Map.of("success", false, "message", "Failed to fetch events"));
        }
    }

    // ================================================================
    // GET APPROVAL STATISTICS
    // ================================================================

    /**
     * Get event approval statistics
     * GET /api/admin/events/stats
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getApprovalStats() {
        try {
            List<EventResponse> pending = eventService.getPendingEvents();
            List<EventResponse> approved = eventService.getApprovedEvents();
            List<EventResponse> rejected = eventService.getRejectedEvents();
            
            return ResponseEntity.ok(Map.of(
                "pending", pending.size(),
                "approved", approved.size(),
                "rejected", rejected.size(),
                "total", pending.size() + approved.size() + rejected.size()
            ));
            
        } catch (Exception e) {
            System.err.println("Error fetching stats: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}