// ================================================================
// FILE 2: OrganizerExportController.java
// Location: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\controller\
// ================================================================
package com.eventzen.controller;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;
import com.opencsv.CSVWriter;

@RestController
@RequestMapping("/api/organizer")
@PreAuthorize("hasRole('ORGANIZER')")
public class OrganizerExportController {

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Export event registrations as CSV
     * Only accessible by event owner
     */
    @GetMapping("/events/{eventId}/export")
    public ResponseEntity<?> exportRegistrations(
            @PathVariable Long eventId,
            @RequestParam(defaultValue = "csv") String format) {
        try {
            // Verify ownership
            Long currentOrganizerId = getCurrentUserId();
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new Exception("Event not found"));

            if (!event.getOrganizerId().equals(currentOrganizerId)) {
                return ResponseEntity.status(403)
                        .body("You can only export registrations for your own events");
            }

            if ("csv".equalsIgnoreCase(format)) {
                byte[] csvData = generateCsv(eventId, event.getTitle());

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.parseMediaType("text/csv"));
                headers.setContentDispositionFormData("attachment",
                        sanitizeFilename(event.getTitle()) + "_registrations.csv");

                return ResponseEntity.ok()
                        .headers(headers)
                        .body(csvData);
            } else {
                return ResponseEntity.badRequest()
                        .body("Only CSV format is supported");
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Export failed: " + e.getMessage());
        }
    }

    private byte[] generateCsv(Long eventId, String eventTitle) throws Exception {
        List<Registration> registrations = registrationRepository.findByEventIdOrderByRegisteredAtDesc(eventId);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        OutputStreamWriter osw = new OutputStreamWriter(baos);
        CSVWriter writer = new CSVWriter(osw);

        // Header
        String[] header = {
                "Registration ID",
                "Visitor Name",
                "Email",
                "Phone",
                "Status",
                "Registration Date",
                "Notes"
        };
        writer.writeNext(header);

        // Data rows
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

        for (Registration reg : registrations) {
            String[] row = {
                    reg.getId().toString(),
                    reg.getVisitor().getName(),
                    reg.getVisitor().getEmail(),
                    reg.getPhone() != null ? reg.getPhone() : "N/A",
                    reg.getStatus().toString(),
                    reg.getRegisteredAt() != null ? reg.getRegisteredAt().format(formatter) : "N/A",
                    reg.getNotes() != null ? reg.getNotes() : ""
            };
            writer.writeNext(row);
        }

        writer.close();
        return baos.toByteArray();
    }

    private String sanitizeFilename(String filename) {
        return filename.replaceAll("[^a-zA-Z0-9-_\\.]", "_");
    }

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
}