// ================================================================
// FILE: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\controller\VisitorController.java
// 🆕 NEW FILE - Create this in controller package
// ================================================================

package com.eventzen.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.eventzen.dto.response.EventCalendarResponse;
import com.eventzen.service.impl.EventServiceImpl;

@RestController
@RequestMapping("/api/visitor")
public class VisitorController {

    @Autowired
    private EventServiceImpl eventServiceImpl;

    /**
     * Get events for visitor calendar view
     * Returns only events that the authenticated visitor is registered for
     */
    @GetMapping("/calendar/events")
    @PreAuthorize("hasAuthority('VISITOR')")
    public ResponseEntity<List<EventCalendarResponse>> getEventsForVisitorCalendar(
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String from,
            @RequestParam(required = true) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) String to) {
        try {
            System.out.println("📅 Visitor Calendar request: " + from + " to " + to);

            LocalDate startDate = LocalDate.parse(from);
            LocalDate endDate = LocalDate.parse(to);

            List<EventCalendarResponse> events = eventServiceImpl.getEventsForVisitorCalendar(
                    startDate, endDate);

            return ResponseEntity.ok(events);
        } catch (Exception e) {
            System.out.println("Error fetching visitor calendar events: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }
}