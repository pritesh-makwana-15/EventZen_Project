// ================================================================
// FILE 4: TicketController.java
// Location: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\controller\
// ================================================================
package com.eventzen.controller;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

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
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.UserRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.*;

@RestController
@RequestMapping("/api/organizer")
@PreAuthorize("hasRole('ORGANIZER')")
public class TicketController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Preview sample PDF ticket for an event
     * Only accessible by event owner
     */
    @GetMapping("/events/{eventId}/ticket/preview")
    public ResponseEntity<?> previewTicket(@PathVariable Long eventId) {
        try {
            // Verify ownership
            Long currentOrganizerId = getCurrentUserId();
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new Exception("Event not found"));

            if (!event.getOrganizerId().equals(currentOrganizerId)) {
                return ResponseEntity.status(403)
                        .body("You can only preview tickets for your own events");
            }

            // Generate PDF
            byte[] pdfData = generateTicketPdf(event);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("inline",
                    sanitizeFilename(event.getTitle()) + "_ticket_preview.pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfData);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate ticket preview: " + e.getMessage());
        }
    }

    private byte[] generateTicketPdf(Event event) throws Exception {
        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);

        document.open();

        // Add header
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.DARK_GRAY);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);

        // Title
        Paragraph title = new Paragraph("EVENT TICKET", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Sample ticket info
        document.add(new Paragraph("SAMPLE TICKET PREVIEW", headerFont));
        document.add(Chunk.NEWLINE);

        // Event details
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10);

        addTableRow(table, "Event Name:", event.getTitle(), headerFont, normalFont);
        addTableRow(table, "Description:", event.getDescription(), headerFont, normalFont);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        addTableRow(table, "Date:",
                event.getStartDate().format(dateFormatter) + " to " + event.getEndDate().format(dateFormatter),
                headerFont, normalFont);
        addTableRow(table, "Time:",
                event.getStartTime().format(timeFormatter) + " - " + event.getEndTime().format(timeFormatter),
                headerFont, normalFont);

        String location = event.getLocation() != null ? event.getLocation()
                : event.getAddress() + ", " + event.getCity() + ", " + event.getState();
        addTableRow(table, "Location:", location, headerFont, normalFont);

        addTableRow(table, "Category:", event.getCategory(), headerFont, normalFont);
        addTableRow(table, "Event Type:", event.getEventType(), headerFont, normalFont);

        document.add(table);
        document.add(Chunk.NEWLINE);

        // Visitor info placeholder
        document.add(new Paragraph("Visitor Information", headerFont));
        PdfPTable visitorTable = new PdfPTable(2);
        visitorTable.setWidthPercentage(100);
        visitorTable.setSpacingBefore(10);

        addTableRow(visitorTable, "Name:", "[Visitor Name]", headerFont, normalFont);
        addTableRow(visitorTable, "Email:", "[visitor@email.com]", headerFont, normalFont);
        addTableRow(visitorTable, "Ticket ID:", "[TICKET-" + event.getId() + "-SAMPLE]", headerFont, normalFont);

        document.add(visitorTable);
        document.add(Chunk.NEWLINE);

        // QR Code placeholder
        document.add(new Paragraph("QR Code", headerFont));
        Paragraph qrPlaceholder = new Paragraph("[QR CODE WILL BE GENERATED HERE]", normalFont);
        qrPlaceholder.setAlignment(Element.ALIGN_CENTER);
        qrPlaceholder.setSpacingBefore(10);
        qrPlaceholder.setSpacingAfter(10);
        document.add(qrPlaceholder);

        // Footer
        Paragraph footer = new Paragraph(
                "This is a sample ticket preview. Actual tickets will be generated upon visitor registration.",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(20);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
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