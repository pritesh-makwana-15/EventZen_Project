// ================================================================
// FILE 1: AdminVenueController.java
// ================================================================
package com.eventzen.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.eventzen.dto.request.CreateVenueRequest;
import com.eventzen.dto.request.UpdateVenueRequest;
import com.eventzen.dto.response.VenueResponse;
import com.eventzen.dto.response.VenueConflictResponse;
import com.eventzen.service.VenueService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/venues")
@PreAuthorize("hasRole('ADMIN')")
public class AdminVenueController {

    @Autowired
    private VenueService venueService;

    @GetMapping
    public ResponseEntity<List<VenueResponse>> getAllVenues() {
        List<VenueResponse> venues = venueService.getAllVenues();
        return ResponseEntity.ok(venues);
    }

    @GetMapping("/active")
    public ResponseEntity<List<VenueResponse>> getActiveVenues() {
        List<VenueResponse> venues = venueService.getActiveVenues();
        return ResponseEntity.ok(venues);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueResponse> getVenueById(@PathVariable Long id) {
        try {
            VenueResponse venue = venueService.getVenueById(id);
            return ResponseEntity.ok(venue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<?> createVenue(@Valid @RequestBody CreateVenueRequest request) {
        try {
            VenueResponse venue = venueService.createVenue(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(venue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateVenue(@PathVariable Long id, @RequestBody UpdateVenueRequest request) {
        try {
            VenueResponse venue = venueService.updateVenue(id, request);
            return ResponseEntity.ok(venue);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVenue(@PathVariable Long id) {
        try {
            venueService.deleteVenue(id);
            return ResponseEntity.ok("Venue deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{id}/conflicts")
    public ResponseEntity<List<VenueConflictResponse>> getVenueConflicts(@PathVariable Long id) {
        List<VenueConflictResponse> conflicts = venueService.getVenueConflicts(id);
        return ResponseEntity.ok(conflicts);
    }
}