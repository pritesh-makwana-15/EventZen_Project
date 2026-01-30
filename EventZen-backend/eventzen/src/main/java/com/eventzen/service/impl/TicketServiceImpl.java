// ================================================================
// FILE: TicketServiceImpl.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/service/impl/
// ================================================================

package com.eventzen.service.impl;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.Ticket;
import com.eventzen.entity.User;
import com.eventzen.repository.TicketRepository;
import com.eventzen.service.TicketService;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.itextpdf.text.BaseColor;
import com.itextpdf.text.Chunk;
import com.itextpdf.text.Document;
import com.itextpdf.text.Element;
import com.itextpdf.text.Font;
import com.itextpdf.text.FontFactory;
import com.itextpdf.text.Image;
import com.itextpdf.text.PageSize;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.Rectangle;
import com.itextpdf.text.pdf.PdfPCell;
import com.itextpdf.text.pdf.PdfPTable;
import com.itextpdf.text.pdf.PdfWriter;

@Service
public class TicketServiceImpl implements TicketService {

    @Autowired
    private TicketRepository ticketRepository;

    @Override
    @Transactional
    public Ticket generateTicket(Registration registration) throws Exception {
        // Check if ticket already exists
        if (ticketRepository.existsByRegistrationId(registration.getId())) {
            return ticketRepository.findByRegistrationId(registration.getId())
                    .orElseThrow(() -> new Exception("Ticket exists but cannot be retrieved"));
        }

        // Generate unique ticket code
        String ticketCode = generateTicketCode(registration);

        // Generate QR code
        String qrCodeData = generateQRCode(ticketCode);

        // Create ticket
        Ticket ticket = new Ticket(registration, ticketCode, qrCodeData);
        return ticketRepository.save(ticket);
    }

    @Override
    public Ticket getTicketByRegistrationId(Long registrationId) throws Exception {
        return ticketRepository.findByRegistrationId(registrationId)
                .orElseThrow(() -> new Exception("Ticket not found for this registration"));
    }

    @Override
    public Ticket getTicketById(Long ticketId) throws Exception {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new Exception("Ticket not found"));
    }

    @Override
    public byte[] generateTicketPdf(Long ticketId) throws Exception {
        Ticket ticket = getTicketById(ticketId);
        Registration registration = ticket.getRegistration();
        Event event = registration.getEvent();
        User visitor = registration.getVisitor();

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter.getInstance(document, baos);

        document.open();

        // Fonts
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 24, BaseColor.DARK_GRAY);
        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 14, BaseColor.BLACK);
        Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 12, BaseColor.BLACK);

        // Title
        Paragraph title = new Paragraph("EVENT TICKET", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingAfter(20);
        document.add(title);

        // Event Details
        document.add(new Paragraph("Event Information", headerFont));
        document.add(Chunk.NEWLINE);

        PdfPTable eventTable = new PdfPTable(2);
        eventTable.setWidthPercentage(100);
        eventTable.setSpacingBefore(10);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        addTableRow(eventTable, "Event Name:", event.getTitle(), headerFont, normalFont);
        addTableRow(eventTable, "Date:",
                event.getStartDate().format(dateFormatter) + " to " + event.getEndDate().format(dateFormatter),
                headerFont, normalFont);
        addTableRow(eventTable, "Time:",
                event.getStartTime().format(timeFormatter) + " - " + event.getEndTime().format(timeFormatter),
                headerFont, normalFont);
        addTableRow(eventTable, "Location:", event.getLocation(), headerFont, normalFont);
        addTableRow(eventTable, "Category:", event.getCategory(), headerFont, normalFont);

        document.add(eventTable);
        document.add(Chunk.NEWLINE);

        // Visitor Information
        document.add(new Paragraph("Visitor Information", headerFont));
        PdfPTable visitorTable = new PdfPTable(2);
        visitorTable.setWidthPercentage(100);
        visitorTable.setSpacingBefore(10);

        addTableRow(visitorTable, "Name:", visitor.getName(), headerFont, normalFont);
        addTableRow(visitorTable, "Email:", visitor.getEmail(), headerFont, normalFont);
        addTableRow(visitorTable, "Ticket ID:", ticket.getTicketCode(), headerFont, normalFont);
        addTableRow(visitorTable, "Issued On:",
                ticket.getIssuedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm")), headerFont, normalFont);

        document.add(visitorTable);
        document.add(Chunk.NEWLINE);

        // QR Code
        document.add(new Paragraph("Scan QR Code for Check-in", headerFont));
        document.add(Chunk.NEWLINE);

        if (ticket.getQrCodeData() != null) {
            byte[] qrBytes = Base64.getDecoder().decode(ticket.getQrCodeData());
            Image qrImage = Image.getInstance(qrBytes);
            qrImage.scaleToFit(200, 200);
            qrImage.setAlignment(Element.ALIGN_CENTER);
            document.add(qrImage);
        }

        document.add(Chunk.NEWLINE);

        // Footer
        Paragraph footer = new Paragraph(
                "Please present this ticket at the event entrance. Keep this ticket safe.",
                FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10, BaseColor.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        footer.setSpacingBefore(20);
        document.add(footer);

        document.close();
        return baos.toByteArray();
    }

    @Override
    public boolean hasTicket(Long registrationId) {
        return ticketRepository.existsByRegistrationId(registrationId);
    }

    // Helper Methods

    private String generateTicketCode(Registration registration) {
        Event event = registration.getEvent();
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return String.format("TKT-%d-%d-%s", event.getId(), registration.getId(), uuid);
    }

    private String generateQRCode(String ticketCode) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        BitMatrix bitMatrix = qrCodeWriter.encode(ticketCode, BarcodeFormat.QR_CODE, 300, 300);

        BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(qrImage, "PNG", baos);
        byte[] qrBytes = baos.toByteArray();

        return Base64.getEncoder().encodeToString(qrBytes);
    }

    private void addTableRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell labelCell = new PdfPCell(new com.itextpdf.text.Phrase(label, labelFont));
        labelCell.setBorder(Rectangle.NO_BORDER);
        labelCell.setPadding(5);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new com.itextpdf.text.Phrase(value != null ? value : "N/A", valueFont));
        valueCell.setBorder(Rectangle.NO_BORDER);
        valueCell.setPadding(5);
        table.addCell(valueCell);
    }
}