// ================================================================
// FILE 2: VenueServiceImpl.java
// ================================================================
package com.eventzen.service.impl;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.dto.request.CreateVenueRequest;
import com.eventzen.dto.request.UpdateVenueRequest;
import com.eventzen.dto.response.VenueConflictResponse;
import com.eventzen.dto.response.VenueResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Venue;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.VenueRepository;
import com.eventzen.service.VenueService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class VenueServiceImpl implements VenueService {

    @Autowired
    private VenueRepository venueRepository;

    @Autowired
    private EventRepository eventRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public VenueResponse createVenue(CreateVenueRequest request) throws Exception {
        System.out.println("Creating new venue: " + request.getName());

        Venue venue = new Venue();
        venue.setName(request.getName());
        venue.setAddress(request.getAddress());
        venue.setCity(request.getCity());
        venue.setState(request.getState());
        venue.setCapacity(request.getCapacity());
        venue.setMapData(request.getMapData());
        venue.setImageUrl(request.getImageUrl());
        venue.setIsActive(true);

        // Handle unavailable dates
        if (request.getUnavailableDates() != null && !request.getUnavailableDates().isEmpty()) {
            venue.setUnavailableDatesList(request.getUnavailableDates());
        }

        Venue savedVenue = venueRepository.save(venue);
        return convertToResponse(savedVenue);
    }

    @Override
    public VenueResponse updateVenue(Long venueId, UpdateVenueRequest request) throws Exception {
        System.out.println("Updating venue ID: " + venueId);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new Exception("Venue not found"));

        if (request.getName() != null)
            venue.setName(request.getName());
        if (request.getAddress() != null)
            venue.setAddress(request.getAddress());
        if (request.getCity() != null)
            venue.setCity(request.getCity());
        if (request.getState() != null)
            venue.setState(request.getState());
        if (request.getCapacity() != null)
            venue.setCapacity(request.getCapacity());
        if (request.getMapData() != null)
            venue.setMapData(request.getMapData());
        if (request.getImageUrl() != null)
            venue.setImageUrl(request.getImageUrl());
        if (request.getIsActive() != null)
            venue.setIsActive(request.getIsActive());

        if (request.getUnavailableDates() != null) {
            venue.setUnavailableDatesList(request.getUnavailableDates());
        }

        Venue updatedVenue = venueRepository.save(venue);
        return convertToResponse(updatedVenue);
    }

    @Override
    @Transactional
    public void deleteVenue(Long venueId) throws Exception {
        System.out.println("Deleting venue ID: " + venueId);

        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new Exception("Venue not found"));

        // Check if venue has events
        long eventCount = eventRepository.countByVenue_Id(venueId);
        if (eventCount > 0) {
            throw new Exception("Cannot delete venue with " + eventCount
                    + " associated events. Please reassign or delete events first.");
        }

        venueRepository.delete(venue);
    }

    @Override
    public VenueResponse getVenueById(Long venueId) throws Exception {
        Venue venue = venueRepository.findById(venueId)
                .orElseThrow(() -> new Exception("Venue not found"));
        return convertToResponse(venue);
    }

    @Override
    public List<VenueResponse> getAllVenues() {
        List<Venue> venues = venueRepository.findAll();
        return venues.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<VenueResponse> getActiveVenues() {
        List<Venue> venues = venueRepository.findByIsActiveTrue();
        return venues.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public boolean checkVenueAvailability(Long venueId, LocalDate startDate, LocalDate endDate, Long excludeEventId) {
        List<Event> conflicts = eventRepository.findConflictingEvents(
                venueId, startDate, endDate, excludeEventId != null ? excludeEventId : -1L);
        return conflicts.isEmpty();
    }

    @Override
    public List<VenueConflictResponse> getVenueConflicts(Long venueId) {
        List<Event> events = eventRepository.findByVenue_Id(venueId);
        List<VenueConflictResponse> conflicts = new ArrayList<>();

        // Compare each event with others
        for (int i = 0; i < events.size(); i++) {
            Event event1 = events.get(i);
            for (int j = i + 1; j < events.size(); j++) {
                Event event2 = events.get(j);

                // Check if dates overlap
                boolean overlaps = !(event1.getEndDate().isBefore(event2.getStartDate()) ||
                        event1.getStartDate().isAfter(event2.getEndDate()));

                if (overlaps) {
                    VenueConflictResponse conflict = new VenueConflictResponse();
                    conflict.setVenueId(venueId);
                    conflict.setVenueName(event1.getVenueName());

                    conflict.setEventId1(event1.getId());
                    conflict.setEventTitle1(event1.getTitle());
                    conflict.setStartDate1(event1.getStartDate());
                    conflict.setStartTime1(event1.getStartTime());
                    conflict.setEndDate1(event1.getEndDate());
                    conflict.setEndTime1(event1.getEndTime());

                    conflict.setEventId2(event2.getId());
                    conflict.setEventTitle2(event2.getTitle());
                    conflict.setStartDate2(event2.getStartDate());
                    conflict.setStartTime2(event2.getStartTime());
                    conflict.setEndDate2(event2.getEndDate());
                    conflict.setEndTime2(event2.getEndTime());

                    conflicts.add(conflict);
                }
            }
        }

        return conflicts;
    }

    private VenueResponse convertToResponse(Venue venue) {
        VenueResponse response = new VenueResponse();
        response.setId(venue.getId());
        response.setName(venue.getName());
        response.setAddress(venue.getAddress());
        response.setCity(venue.getCity());
        response.setState(venue.getState());
        response.setCapacity(venue.getCapacity());
        response.setMapData(venue.getMapData());
        response.setUnavailableDates(venue.getUnavailableDatesList());
        response.setImageUrl(venue.getImageUrl());
        response.setIsActive(venue.getIsActive());
        response.setCreatedAt(venue.getCreatedAt());
        response.setUpdatedAt(venue.getUpdatedAt());

        // Count total events
        long eventCount = eventRepository.countByVenue_Id(venue.getId());
        response.setTotalEvents((int) eventCount);

        return response;
    }
}