// ================================================================
// FILE 1: VenueService.java (Interface)
// ================================================================
package com.eventzen.service;

import java.time.LocalDate;
import java.util.List;
import com.eventzen.dto.request.CreateVenueRequest;
import com.eventzen.dto.request.UpdateVenueRequest;
import com.eventzen.dto.response.VenueResponse;
import com.eventzen.dto.response.VenueConflictResponse;

public interface VenueService {
    VenueResponse createVenue(CreateVenueRequest request) throws Exception;
    VenueResponse updateVenue(Long venueId, UpdateVenueRequest request) throws Exception;
    void deleteVenue(Long venueId) throws Exception;
    VenueResponse getVenueById(Long venueId) throws Exception;
    List<VenueResponse> getAllVenues();
    List<VenueResponse> getActiveVenues();
    boolean checkVenueAvailability(Long venueId, LocalDate startDate, LocalDate endDate, Long excludeEventId);
    List<VenueConflictResponse> getVenueConflicts(Long venueId);
}