// ================================================================
// FILE 2: AdminExportController.java
// ================================================================
package com.eventzen.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.eventzen.service.ExportService;

@RestController
@RequestMapping("/api/admin/export")
@PreAuthorize("hasRole('ADMIN')")
public class AdminExportController {

    @Autowired
    private ExportService exportService;

    // ========== EVENTS EXPORT ==========

    @GetMapping("/events/csv")
    public ResponseEntity<byte[]> exportEventsToCsv() {
        try {
            byte[] data = exportService.exportEventsToCsv();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "events.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/events/pdf")
    public ResponseEntity<byte[]> exportEventsToPdf() {
        try {
            byte[] data = exportService.exportEventsToPdf();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "events.pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // ========== USERS EXPORT ==========

    @GetMapping("/users/csv")
    public ResponseEntity<byte[]> exportUsersToCsv() {
        try {
            byte[] data = exportService.exportUsersToCsv();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "users.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/users/pdf")
    public ResponseEntity<byte[]> exportUsersToPdf() {
        try {
            byte[] data = exportService.exportUsersToPdf();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "users.pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // ========== REGISTRATIONS EXPORT ==========

    @GetMapping("/registrations/csv")
    public ResponseEntity<byte[]> exportRegistrationsToCsv() {
        try {
            byte[] data = exportService.exportRegistrationsToCsv();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "registrations.csv");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/registrations/pdf")
    public ResponseEntity<byte[]> exportRegistrationsToPdf() {
        try {
            byte[] data = exportService.exportRegistrationsToPdf();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "registrations.pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(data);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}