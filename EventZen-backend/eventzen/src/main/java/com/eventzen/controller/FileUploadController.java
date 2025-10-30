// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/controller/FileUploadController.java
// CHANGES: FIXED - Returns FULL URL with base path for image display
// ================================================================

package com.eventzen.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/uploads")
public class FileUploadController {

    @Value("${file.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Upload file (images) for events and profiles
     * Endpoint: POST /api/uploads
     * Content-Type: multipart/form-data
     * 
     * FIXED: Now returns FULL URL (http://localhost:8080/uploads/...)
     * so images display correctly in frontend
     */
    @PostMapping
    @PreAuthorize("hasAnyAuthority('ORGANIZER', 'VISITOR', 'ADMIN')")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        try {
            // Validate file exists
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Please select a file to upload"));
            }

            // Validate file type (images only)
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Only image files are allowed (JPEG, PNG, GIF, WebP)"));
            }

            // Validate file size (5MB max)
            long maxSize = 5 * 1024 * 1024; // 5MB
            if (file.getSize() > maxSize) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File size must be less than 5MB"));
            }

            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Created upload directory: " + uploadPath.toAbsolutePath());
            }

            // Generate unique filename to prevent collisions
            String originalFilename = file.getOriginalFilename();
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + fileExtension;

            // Save file to disk
            Path filePath = uploadPath.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // ✅ FIXED: Build FULL URL with protocol, host, and port
            String scheme = request.getScheme(); // http or https
            String serverName = request.getServerName(); // localhost
            int serverPort = request.getServerPort(); // 8080
            String contextPath = request.getContextPath(); // empty or /api

            // Build base URL
            String baseUrl = scheme + "://" + serverName;
            if ((scheme.equals("http") && serverPort != 80) || 
                (scheme.equals("https") && serverPort != 443)) {
                baseUrl += ":" + serverPort;
            }
            baseUrl += contextPath;

            // Full accessible URL
            String fileUrl = baseUrl + "/uploads/" + uniqueFilename;

            System.out.println("✅ File uploaded successfully:");
            System.out.println("   Original: " + originalFilename);
            System.out.println("   Saved as: " + uniqueFilename);
            System.out.println("   Size: " + file.getSize() + " bytes");
            System.out.println("   Full URL: " + fileUrl);
            System.out.println("   File Path: " + filePath.toAbsolutePath());

            return ResponseEntity.ok(Map.of(
                    "url", fileUrl,
                    "filename", uniqueFilename,
                    "size", file.getSize()));

        } catch (IOException e) {
            System.err.println("❌ Error uploading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));

        } catch (Exception e) {
            System.err.println("❌ Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "An unexpected error occurred"));
        }
    }
}