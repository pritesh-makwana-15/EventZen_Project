// ================================================================
// FILE: VisitorTicketController.java (NEW FILE)
// Location: src/main/java/com/eventzen/controller/
// PURPOSE: Handle visitor ticket downloads
// STATUS: ✅ NEW - Separate visitor ticket operations
// ================================================================

package com.eventzen.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.entity.Registration;
import com.eventzen.entity.RegistrationStatus;
import com.eventzen.entity.Ticket;
import com.eventzen.entity.User;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.TicketService;

@RestController
@RequestMapping("/api/visitor")
@PreAuthorize("hasRole('VISITOR')")
public class VisitorTicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 🎫 Download ticket PDF for a registration
     * Endpoint: GET /api/visitor/registrations/{registrationId}/ticket/download
     * 
     * Security: Only the visitor who owns the registration can download
     */
    @GetMapping("/registrations/{registrationId}/ticket/download")
    public ResponseEntity<?> downloadTicket(@PathVariable Long registrationId) {
        try {
            System.out.println("=== TICKET DOWNLOAD REQUEST ===");
            System.out.println("Registration ID: " + registrationId);

            // Step 1: Get current user
            Long currentUserId = getCurrentUserId();
            System.out.println("Current User ID: " + currentUserId);

            // Step 2: Verify registration exists
            Registration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new Exception("Registration not found"));

            // Step 3: SECURITY CHECK - Verify ownership
            if (!registration.getVisitor().getId().equals(currentUserId)) {
                System.out.println("❌ ACCESS DENIED - User " + currentUserId +
                        " tried to access registration owned by " + registration.getVisitor().getId());
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of(
                                "error", "Access denied",
                                "message", "You can only download your own tickets"));
            }

            // Step 4: Check registration status
            if (registration.getStatus() == RegistrationStatus.CANCELLED) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(
                                "error", "Registration cancelled",
                                "message", "Cannot download ticket for cancelled registration"));
            }

            // Step 5: Check if ticket exists
            if (!ticketService.hasTicket(registrationId)) {
                System.out.println("⚠️ Ticket not found, generating now...");

                // Auto-generate ticket if missing
                try {
                    ticketService.generateTicket(registration);
                    System.out.println("✅ Ticket generated successfully");
                } catch (Exception e) {
                    System.err.println("❌ Ticket generation failed: " + e.getMessage());
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body(Map.of(
                                    "error", "Ticket generation failed",
                                    "message", "Unable to generate ticket. Please try again or contact support."));
                }
            }

            // Step 6: Get ticket
            Ticket ticket = ticketService.getTicketByRegistrationId(registrationId);
            System.out.println("Ticket ID: " + ticket.getId());
            System.out.println("Ticket Code: " + ticket.getTicketCode());

            // Step 7: Generate PDF
            byte[] pdfData = ticketService.generateTicketPdf(ticket.getId());
            System.out.println("PDF generated - Size: " + pdfData.length + " bytes");

            // Step 8: Set response headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);

            String filename = sanitizeFilename(
                    registration.getEvent().getTitle() + "_Ticket_" + ticket.getTicketCode()) + ".pdf";

            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(pdfData.length);

            System.out.println("✅ Ticket download successful");
            System.out.println("=== TICKET DOWNLOAD COMPLETE ===");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfData);

        } catch (Exception e) {
            System.err.println("❌ Ticket download error: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Download failed",
                            "message", e.getMessage()));
        }
    }

    /**
     * 🔍 Check if ticket exists for a registration
     * Endpoint: GET /api/visitor/registrations/{registrationId}/ticket/exists
     * 
     * Returns: {"exists": true/false}
     */
    @GetMapping("/registrations/{registrationId}/ticket/exists")
    public ResponseEntity<?> checkTicketExists(@PathVariable Long registrationId) {
        try {
            // Verify ownership
            Long currentUserId = getCurrentUserId();
            Registration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new Exception("Registration not found"));

            if (!registration.getVisitor().getId().equals(currentUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            boolean exists = ticketService.hasTicket(registrationId);

            Map<String, Object> response = new HashMap<>();
            response.put("exists", exists);
            response.put("registrationId", registrationId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Check failed",
                            "message", e.getMessage()));
        }
    }

    /**
     * 🎫 Get ticket details (without downloading PDF)
     * Endpoint: GET /api/visitor/registrations/{registrationId}/ticket
     */
    @GetMapping("/registrations/{registrationId}/ticket")
    public ResponseEntity<?> getTicketDetails(@PathVariable Long registrationId) {
        try {
            // Verify ownership
            Long currentUserId = getCurrentUserId();
            Registration registration = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new Exception("Registration not found"));

            if (!registration.getVisitor().getId().equals(currentUserId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "Access denied"));
            }

            // Get ticket
            Ticket ticket = ticketService.getTicketByRegistrationId(registrationId);

            // Create safe response (don't expose QR code data in JSON)
            Map<String, Object> response = new HashMap<>();
            response.put("ticketId", ticket.getId());
            response.put("ticketCode", ticket.getTicketCode());
            response.put("issuedAt", ticket.getIssuedAt());
            response.put("isCheckedIn", ticket.getIsCheckedIn());
            response.put("registrationId", registrationId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "error", "Ticket not found",
                            "message", e.getMessage()));
        }
    }

    // ================================================================
    // HELPER METHODS
    // ================================================================

    /**
     * Get current authenticated user ID
     */
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

    /**
     * Sanitize filename for safe download
     */
    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9-_\\.]", "_");
    }
}