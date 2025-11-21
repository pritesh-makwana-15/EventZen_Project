package com.eventzen.analytics;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eventzen.entity.Event;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;

/**
 * Service for analytics aggregations
 * 
 * Features:
 * - Admin-level platform analytics
 * - Organizer-specific performance metrics
 * - Category distribution
 * - Monthly trends with zero-value months
 */
@Service
public class AnalyticsService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RegistrationRepository registrationRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Get global platform summary statistics (Admin)
     * Returns: total users, total events, total registrations
     */
    public Map<String, Object> getAdminSummary() {
        Map<String, Object> summary = new HashMap<>();

        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        long totalRegistrations = registrationRepository.count();

        summary.put("totalUsers", totalUsers);
        summary.put("totalEvents", totalEvents);
        summary.put("totalRegistrations", totalRegistrations);

        return summary;
    }

    /**
     * Get event category distribution (Admin)
     * Returns: list of {category, count} objects sorted by count descending
     */
    public List<Map<String, Object>> getCategoryDistribution() {
        List<Event> allEvents = eventRepository.findAll();

        Map<String, Long> categoryCount = allEvents.stream()
                .filter(e -> e.getCategory() != null && !e.getCategory().isEmpty())
                .collect(Collectors.groupingBy(Event::getCategory, Collectors.counting()));

        List<Map<String, Object>> result = categoryCount.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("category", entry.getKey());
                    item.put("count", entry.getValue());
                    return item;
                })
                .sorted((a, b) -> Long.compare((Long) b.get("count"), (Long) a.get("count")))
                .collect(Collectors.toList());

        return result;
    }

    /**
     * Get monthly registration trends (Admin)
     * Returns: list of {month, year, count} for last 12 months
     * Includes months with zero registrations
     */
    public List<Map<String, Object>> getMonthlyRegistrationTrends() {
        List<Event> allEvents = eventRepository.findAll();

        Map<YearMonth, Long> monthlyCount = new HashMap<>();

        for (Event event : allEvents) {
            if (event.getDate() != null) {
                YearMonth month = YearMonth.from(event.getDate());
                long registrationCount = registrationRepository.countByEventId(event.getId());
                monthlyCount.put(month, monthlyCount.getOrDefault(month, 0L) + registrationCount);
            }
        }

        YearMonth now = YearMonth.now();
        YearMonth startMonth = now.minusMonths(11);

        List<Map<String, Object>> result = new ArrayList<>();
        for (YearMonth month = startMonth; !month.isAfter(now); month = month.plusMonths(1)) {
            Map<String, Object> item = new HashMap<>();
            item.put("month", month.getMonthValue());
            item.put("year", month.getYear());
            item.put("monthName", month.getMonth().toString());
            item.put("count", monthlyCount.getOrDefault(month, 0L));
            result.add(item);
        }

        return result;
    }

    /**
     * Get organizer performance metrics
     * Returns: total events, total registrations, average attendance rate, top
     * events
     */
    public Map<String, Object> getOrganizerPerformance(Long organizerId) {
        Map<String, Object> performance = new HashMap<>();

        List<Event> events = eventRepository.findByOrganizerId(organizerId);

        long totalEvents = events.size();
        performance.put("totalEvents", totalEvents);

        long totalRegistrations = events.stream()
                .mapToLong(event -> registrationRepository.countByEventId(event.getId()))
                .sum();
        performance.put("totalRegistrations", totalRegistrations);

        double avgAttendanceRate = 0;
        List<Map<String, Object>> eventMetrics = new ArrayList<>();

        for (Event event : events) {
            Map<String, Object> eventMetric = new HashMap<>();
            eventMetric.put("eventId", event.getId());
            eventMetric.put("eventTitle", event.getTitle());

            long registrations = registrationRepository.countByEventId(event.getId());
            eventMetric.put("registrations", registrations);

            if (event.getMaxAttendees() != null && event.getMaxAttendees() > 0) {
                double attendanceRate = (double) registrations / event.getMaxAttendees() * 100;
                eventMetric.put("attendanceRate", Math.round(attendanceRate * 10.0) / 10.0);
            } else {
                eventMetric.put("attendanceRate", 0);
            }

            eventMetrics.add(eventMetric);
        }

        if (!eventMetrics.isEmpty()) {
            avgAttendanceRate = eventMetrics.stream()
                    .mapToDouble(em -> (Double) em.get("attendanceRate"))
                    .average()
                    .orElse(0);
            avgAttendanceRate = Math.round(avgAttendanceRate * 10.0) / 10.0;
        }

        performance.put("averageAttendanceRate", avgAttendanceRate);

        List<Map<String, Object>> topEvents = eventMetrics.stream()
                .sorted((a, b) -> Long.compare((Long) b.get("registrations"), (Long) a.get("registrations")))
                .limit(5)
                .collect(Collectors.toList());

        performance.put("topEvents", topEvents);

        return performance;
    }
}