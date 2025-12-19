// ================================================================
// FILE: OrganizerVenueController.java (FIXED)
// Location: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\controller\
// ================================================================
package com.eventzen.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.response.VenueResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Venue;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.VenueRepository;

@RestController
@RequestMapping("/api/organizer/venues")
@PreAuthorize("hasRole('ORGANIZER')")
public class OrganizerVenueController {

        @Autowired
        private VenueRepository venueRepository;

        @Autowired
        private EventRepository eventRepository;

        /**
         * Get all active venues (for dropdown)
         */
        @GetMapping
        public ResponseEntity<List<VenueResponse>> getAllActiveVenues() {
                List<Venue> venues = venueRepository.findByIsActiveTrueOrderByNameAsc();

                List<VenueResponse> response = venues.stream()
                                .map(this::convertToResponse)
                                .toList();

                return ResponseEntity.ok(response);
        }

        /**
         * Get venue details by ID
         */
        @GetMapping("/{venueId}")
        public ResponseEntity<?> getVenueById(@PathVariable Long venueId) {
                try {
                        Venue venue = venueRepository.findById(venueId)
                                        .orElseThrow(() -> new Exception("Venue not found"));

                        VenueResponse response = convertToResponse(venue);
                        return ResponseEntity.ok(response);

                } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        /**
         * Check venue availability for a date range
         * 
         * @param venueId        Venue ID
         * @param startDate      Start date (YYYY-MM-DD)
         * @param endDate        End date (YYYY-MM-DD)
         * @param excludeEventId Optional: Event ID to exclude (for editing)
         * @return Availability status with conflicting events if any
         */
        @GetMapping("/{venueId}/availability")
        public ResponseEntity<?> checkVenueAvailability(
                        @PathVariable Long venueId,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @RequestParam(required = false) Long excludeEventId) {
                try {
                        Venue venue = venueRepository.findById(venueId)
                                        .orElseThrow(() -> new Exception("Venue not found"));

                        if (!venue.getIsActive()) {
                                return ResponseEntity.ok(Map.of(
                                                "available", false,
                                                "reason", "Venue is not active",
                                                "conflicts", List.of()));
                        }

                        // Check for conflicting events
                        Long excludeId = excludeEventId != null ? excludeEventId : -1L;
                        List<Event> conflicts = eventRepository.findConflictingEvents(
                                        venueId, startDate, endDate, excludeId);

                        boolean isAvailable = conflicts.isEmpty();

                        // 🔧 FIXED: Use HashMap instead of Map.of() to avoid 10-argument limit
                        List<Map<String, Object>> conflictDetails = conflicts.stream()
                                        .map(event -> {
                                                Map<String, Object> detail = new HashMap<>();
                                                detail.put("eventId", event.getId());
                                                detail.put("eventTitle", event.getTitle());
                                                detail.put("startDate", event.getStartDate().toString());
                                                detail.put("endDate", event.getEndDate().toString());
                                                return detail;
                                        })
                                        .toList();

                        // 🔧 FIXED: Use HashMap for response
                        Map<String, Object> responseMap = new HashMap<>();
                        responseMap.put("available", isAvailable);
                        responseMap.put("venueName", venue.getName());
                        responseMap.put("conflicts", conflictDetails);
                        responseMap.put("message", isAvailable
                                        ? "Venue is available for the selected dates"
                                        : "Venue is already booked for the selected dates");

                        return ResponseEntity.ok(responseMap);

                } catch (Exception e) {
                        return ResponseEntity.badRequest()
                                        .body(Map.of("error", e.getMessage()));
                }
        }

        private VenueResponse convertToResponse(Venue venue) {
                VenueResponse response = new VenueResponse();
                response.setId(venue.getId());
                response.setName(venue.getName());
                response.setLocation(venue.getLocation());
                response.setCapacity(venue.getCapacity());
                response.setDescription(venue.getDescription());
                response.setAmenities(venue.getAmenities());
                response.setMapData(venue.getMapData());
                response.setImageUrl(venue.getImageUrl());
                response.setIsActive(venue.getIsActive());
                response.setCreatedAt(venue.getCreatedAt());
                response.setUpdatedAt(venue.getUpdatedAt());
                return response;
        }
}