// ================================================================
// FILE 4: VenueConflictResponse.java
// ================================================================
package com.eventzen.dto.response;

import java.time.LocalDate;
import java.time.LocalTime;

public class VenueConflictResponse {
    private Long venueId;
    private String venueName;
    private Long eventId1;
    private String eventTitle1;
    private LocalDate startDate1;
    private LocalTime startTime1;
    private LocalDate endDate1;
    private LocalTime endTime1;
    private Long eventId2;
    private String eventTitle2;
    private LocalDate startDate2;
    private LocalTime startTime2;
    private LocalDate endDate2;
    private LocalTime endTime2;

    // Getters and Setters
    public Long getVenueId() {
        return venueId;
    }

    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public Long getEventId1() {
        return eventId1;
    }

    public void setEventId1(Long eventId1) {
        this.eventId1 = eventId1;
    }

    public String getEventTitle1() {
        return eventTitle1;
    }

    public void setEventTitle1(String eventTitle1) {
        this.eventTitle1 = eventTitle1;
    }

    public LocalDate getStartDate1() {
        return startDate1;
    }

    public void setStartDate1(LocalDate startDate1) {
        this.startDate1 = startDate1;
    }

    public LocalTime getStartTime1() {
        return startTime1;
    }

    public void setStartTime1(LocalTime startTime1) {
        this.startTime1 = startTime1;
    }

    public LocalDate getEndDate1() {
        return endDate1;
    }

    public void setEndDate1(LocalDate endDate1) {
        this.endDate1 = endDate1;
    }

    public LocalTime getEndTime1() {
        return endTime1;
    }

    public void setEndTime1(LocalTime endTime1) {
        this.endTime1 = endTime1;
    }

    public Long getEventId2() {
        return eventId2;
    }

    public void setEventId2(Long eventId2) {
        this.eventId2 = eventId2;
    }

    public String getEventTitle2() {
        return eventTitle2;
    }

    public void setEventTitle2(String eventTitle2) {
        this.eventTitle2 = eventTitle2;
    }

    public LocalDate getStartDate2() {
        return startDate2;
    }

    public void setStartDate2(LocalDate startDate2) {
        this.startDate2 = startDate2;
    }

    public LocalTime getStartTime2() {
        return startTime2;
    }

    public void setStartTime2(LocalTime startTime2) {
        this.startTime2 = startTime2;
    }

    public LocalDate getEndDate2() {
        return endDate2;
    }

    public void setEndDate2(LocalDate endDate2) {
        this.endDate2 = endDate2;
    }

    public LocalTime getEndTime2() {
        return endTime2;
    }

    public void setEndTime2(LocalTime endTime2) {
        this.endTime2 = endTime2;
    }
}