package com.eventzen.analytics;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ✅ FIXED Analytics Controller
 * Changed ALL @PreAuthorize to use hasRole() instead of hasAuthority()
 */
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    @Autowired
    private AnalyticsService analyticsService;

    /**
     * Get global platform summary (Admin only)
     */
    @GetMapping("/admin/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAdminSummary() {
        try {
            Map<String, Object> summary = analyticsService.getAdminSummary();
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch summary: " + e.getMessage()));
        }
    }

    /**
     * Get event category distribution (Admin only)
     */
    @GetMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCategoryDistribution() {
        try {
            List<Map<String, Object>> categories = analyticsService.getCategoryDistribution();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Get monthly registration trends (Admin only)
     */
    @GetMapping("/admin/monthly-trends")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getMonthlyTrends() {
        try {
            List<Map<String, Object>> trends = analyticsService.getMonthlyRegistrationTrends();
            return ResponseEntity.ok(trends);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * 🆕 Get top organizers by registrations (Admin only)
     */
    @GetMapping("/admin/top-organizers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getTopOrganizers() {
        try {
            List<Map<String, Object>> topOrganizers = analyticsService.getTopOrganizers();
            return ResponseEntity.ok(topOrganizers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * Get organizer performance metrics
     */
    @GetMapping("/organizer/{organizerId}/performance")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ORGANIZER')")
    public ResponseEntity<Map<String, Object>> getOrganizerPerformance(
            @PathVariable Long organizerId) {
        try {
            Map<String, Object> performance = analyticsService.getOrganizerPerformance(organizerId);
            return ResponseEntity.ok(performance);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch organizer performance: " + e.getMessage()));
        }
    }
}