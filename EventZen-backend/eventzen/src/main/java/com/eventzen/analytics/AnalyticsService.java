package com.eventzen.analytics;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.Role;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;

/**
 * ✅ FIXED Analytics Service
 * 
 * Changes:
 * 1. Monthly trends now use REGISTRATION date (not event date)
 * 2. Changed from 12 months to 6 months
 * 3. Added Top Organizers method
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
     * ✅ FIXED: Get monthly registration trends (Admin)
     * 
     * Changes:
     * - Now uses REGISTRATION date instead of event date
     * - Changed from 12 months to 6 months
     * - Uses registrationRepository.findRegistrationsInLast6Months()
     */
    public List<Map<String, Object>> getMonthlyRegistrationTrends() {
        // Get registrations from last 6 months
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        List<Registration> registrations = registrationRepository.findRegistrationsInLast6Months(sixMonthsAgo);

        // Group by YearMonth of registration date
        Map<YearMonth, Long> monthlyCount = registrations.stream()
                .filter(r -> r.getRegisteredAt() != null)
                .collect(Collectors.groupingBy(
                        r -> YearMonth.from(r.getRegisteredAt()),
                        Collectors.counting()));

        // Generate last 6 months including zeros
        YearMonth now = YearMonth.now();
        YearMonth startMonth = now.minusMonths(5); // 6 months total including current

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
     * 🆕 NEW: Get top organizers by total registrations (Admin)
     * 
     * Returns: list of {organizerId, organizerName, totalEvents,
     * totalRegistrations}
     * Sorted by total registrations descending
     */
    public List<Map<String, Object>> getTopOrganizers() {
        // Get all organizers
        List<User> organizers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.ORGANIZER)
                .collect(Collectors.toList());

        List<Map<String, Object>> organizerStats = new ArrayList<>();

        for (User organizer : organizers) {
            List<Event> events = eventRepository.findByOrganizerId(organizer.getId());

            long totalEvents = events.size();
            long totalRegistrations = events.stream()
                    .mapToLong(event -> registrationRepository.countByEventId(event.getId()))
                    .sum();

            Map<String, Object> stat = new HashMap<>();
            stat.put("organizerId", organizer.getId());
            stat.put("organizerName", organizer.getName());
            stat.put("organizerEmail", organizer.getEmail());
            stat.put("totalEvents", totalEvents);
            stat.put("totalRegistrations", totalRegistrations);

            organizerStats.add(stat);
        }

        // Sort by total registrations descending and return top 10
        return organizerStats.stream()
                .sorted((a, b) -> Long.compare(
                        (Long) b.get("totalRegistrations"),
                        (Long) a.get("totalRegistrations")))
                .limit(10)
                .collect(Collectors.toList());
    }

    /**
     * Get organizer performance metrics
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