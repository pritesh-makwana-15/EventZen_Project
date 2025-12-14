// ================================================================
// FILE 2: ExportServiceImpl.java (Using FREE Apache PDFBox)
// ================================================================
package com.eventzen.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.util.List;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.ExportService;
import com.opencsv.CSVWriter;

@Service
public class ExportServiceImpl implements ExportService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    // ========== CSV EXPORTS ==========

    @Override
    public byte[] exportEventsToCsv() throws IOException {
        List<Event> events = eventRepository.findAll();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos));

        // Header
        String[] header = {"ID", "Title", "Category", "Start Date", "End Date", "City", "Organizer ID", "Max Attendees", "Current Attendees"};
        writer.writeNext(header);

        // Data
        for (Event event : events) {
            String[] data = {
                String.valueOf(event.getId()),
                event.getTitle(),
                event.getCategory(),
                event.getStartDate().toString(),
                event.getEndDate().toString(),
                event.getCity(),
                String.valueOf(event.getOrganizerId()),
                String.valueOf(event.getMaxAttendees()),
                String.valueOf(event.getCurrentAttendees())
            };
            writer.writeNext(data);
        }

        writer.close();
        return baos.toByteArray();
    }

    @Override
    public byte[] exportUsersToCsv() throws IOException {
        List<User> users = userRepository.findAll();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos));

        // Header
        String[] header = {"ID", "Name", "Email", "Role", "Mobile Number"};
        writer.writeNext(header);

        // Data
        for (User user : users) {
            String[] data = {
                String.valueOf(user.getId()),
                user.getName(),
                user.getEmail(),
                user.getRole().toString(),
                user.getMobileNumber() != null ? user.getMobileNumber() : "N/A"
            };
            writer.writeNext(data);
        }

        writer.close();
        return baos.toByteArray();
    }

    @Override
    public byte[] exportRegistrationsToCsv() throws IOException {
        List<Registration> registrations = registrationRepository.findAll();
        
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos));

        // Header
        String[] header = {"Registration ID", "Event ID", "Event Title", "User ID", "User Name", "Status", "Registered At"};
        writer.writeNext(header);

        // Data
        for (Registration reg : registrations) {
            String[] data = {
                String.valueOf(reg.getId()),
                String.valueOf(reg.getEvent().getId()),
                reg.getEvent().getTitle(),
                String.valueOf(reg.getVisitor().getId()),
                reg.getVisitor().getName(),
                reg.getStatus().toString(),
                reg.getRegisteredAt().toString()
            };
            writer.writeNext(data);
        }

        writer.close();
        return baos.toByteArray();
    }

    // ========== PDF EXPORTS (Apache PDFBox) ==========

    @Override
    public byte[] exportEventsToPdf() throws IOException {
        List<Event> events = eventRepository.findAll();
        
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);
        
        float y = 750;
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
        contentStream.beginText();
        contentStream.newLineAtOffset(50, y);
        contentStream.showText("Events Report");
        contentStream.endText();
        
        y -= 30;
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        
        for (Event event : events) {
            if (y < 50) {
                contentStream.close();
                page = new PDPage();
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                y = 750;
            }
            
            contentStream.beginText();
            contentStream.newLineAtOffset(50, y);
            contentStream.showText(event.getId() + " - " + event.getTitle() + " (" + event.getCategory() + ")");
            contentStream.endText();
            y -= 15;
        }
        
        contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();
        
        return baos.toByteArray();
    }

    @Override
    public byte[] exportUsersToPdf() throws IOException {
        List<User> users = userRepository.findAll();
        
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);
        
        float y = 750;
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
        contentStream.beginText();
        contentStream.newLineAtOffset(50, y);
        contentStream.showText("Users Report");
        contentStream.endText();
        
        y -= 30;
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        
        for (User user : users) {
            if (y < 50) {
                contentStream.close();
                page = new PDPage();
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                y = 750;
            }
            
            contentStream.beginText();
            contentStream.newLineAtOffset(50, y);
            contentStream.showText(user.getId() + " - " + user.getName() + " (" + user.getRole() + ")");
            contentStream.endText();
            y -= 15;
        }
        
        contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();
        
        return baos.toByteArray();
    }

    @Override
    public byte[] exportRegistrationsToPdf() throws IOException {
        List<Registration> registrations = registrationRepository.findAll();
        
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);
        
        float y = 750;
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, 16);
        contentStream.beginText();
        contentStream.newLineAtOffset(50, y);
        contentStream.showText("Registrations Report");
        contentStream.endText();
        
        y -= 30;
        contentStream.setFont(PDType1Font.HELVETICA, 10);
        
        for (Registration reg : registrations) {
            if (y < 50) {
                contentStream.close();
                page = new PDPage();
                document.addPage(page);
                contentStream = new PDPageContentStream(document, page);
                y = 750;
            }
            
            contentStream.beginText();
            contentStream.newLineAtOffset(50, y);
            contentStream.showText(reg.getId() + " - " + reg.getEvent().getTitle() + " by " + reg.getVisitor().getName());
            contentStream.endText();
            y -= 15;
        }
        
        contentStream.close();

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        document.save(baos);
        document.close();
        
        return baos.toByteArray();
    }
}