// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/repository/EventRepository.java
// 🆕 UPDATED: Added Venue-based queries & conflict checks
// ================================================================

package com.eventzen.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

        // ====================
        // Organizer Based Queries
        // ====================

        List<Event> findByOrganizerIdOrderByStartDateDesc(Long organizerId);

        /**
         * Upcoming events for organizer (startDate >= today)
         */
        List<Event> findByOrganizerIdAndStartDateGreaterThanEqualOrderByStartDateDesc(
                        Long organizerId, LocalDate date);

        /**
         * Past events for organizer (endDate < today)
         */
        List<Event> findByOrganizerIdAndEndDateLessThanOrderByEndDateDesc(
                        Long organizerId, LocalDate date);

        List<Event> findByOrganizerId(Long organizerId);

        // ====================
        // Public / Active Events
        // ====================

        List<Event> findByIsActiveTrueOrderByStartDateDesc();

        @Query("SELECT e FROM Event e WHERE e.eventType = 'PUBLIC' " +
                        "AND e.isActive = true ORDER BY e.startDate DESC")
        List<Event> findPublicEvents();

        // ====================
        // Category / Type Filters
        // ====================

        List<Event> findByCategoryIgnoreCase(String category);

        List<Event> findByCategory(String category);

        List<Event> findByEventType(String eventType);

        // ====================
        // Date Based Queries
        // ====================

        List<Event> findByStartDateBetween(LocalDate startDate, LocalDate endDate);

        List<Event> findByStartDateAfter(LocalDate date);

        List<Event> findByEndDateBefore(LocalDate date);

        /**
         * Events overlapping a date range (calendar-safe)
         */
        @Query("SELECT e FROM Event e WHERE " +
                        "(e.startDate BETWEEN :startDate AND :endDate) OR " +
                        "(e.endDate BETWEEN :startDate AND :endDate) OR " +
                        "(e.startDate <= :startDate AND e.endDate >= :endDate) " +
                        "ORDER BY e.startDate ASC")
        List<Event> findEventsOverlappingDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Organizer events within date range
         */
        @Query("SELECT e FROM Event e WHERE e.organizerId = :organizerId " +
                        "AND e.startDate BETWEEN :startDate AND :endDate " +
                        "ORDER BY e.startDate DESC")
        List<Event> findByOrganizerIdAndDateBetween(
                        @Param("organizerId") Long organizerId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        // ====================
        // Location Filters
        // ====================

        List<Event> findByCity(String city);

        List<Event> findByState(String state);

        // ====================
        // 🆕 Venue Based Queries
        // ====================

        /**
         * Find all events for a venue
         */
        List<Event> findByVenue_Id(Long venueId);
        long countByVenue_Id(Long venueId);

        @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId " +
                        "AND ((e.startDate BETWEEN :startDate AND :endDate) " +
                        "OR (e.endDate BETWEEN :startDate AND :endDate) " +
                        "OR (e.startDate <= :startDate AND e.endDate >= :endDate))")
        List<Event> findByVenueAndDateRange(
                        @Param("venueId") Long venueId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Find conflicting events for a venue (used for availability checks)
         */
        @Query("SELECT e FROM Event e WHERE e.venue.id = :venueId " +
                        "AND e.id != :excludeEventId " +
                        "AND (e.startDate < :endDate AND e.endDate > :startDate)")
        List<Event> findConflictingEvents(
                        @Param("venueId") Long venueId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("excludeEventId") Long excludeEventId);

        // ====================
        // 🆕 Calendar (Admin / Dashboard)
        // ====================

        @Query("SELECT e FROM Event e WHERE " +
                        "(:startDate IS NULL OR e.startDate >= :startDate) AND " +
                        "(:endDate IS NULL OR e.endDate <= :endDate) AND " +
                        "(:category IS NULL OR e.category = :category) AND " +
                        "(:city IS NULL OR e.city = :city) AND " +
                        "(:organizerId IS NULL OR e.organizerId = :organizerId) AND " +
                        "(:eventType IS NULL OR e.eventType = :eventType) " +
                        "ORDER BY e.startDate ASC")
        List<Event> findEventsForCalendar(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("category") String category,
                        @Param("city") String city,
                        @Param("organizerId") Long organizerId,
                        @Param("eventType") String eventType);

        // ====================
        // Count Methods
        // ====================

        long countByOrganizerId(Long organizerId);

        long countByOrganizerIdAndStartDateGreaterThanEqual(Long organizerId, LocalDate date);

        long countByCategory(String category);

        long countByCity(String city);

        // ====================
        // Delete Methods
        // ====================

        /**
         * Delete all events for a specific organizer
         */
        @Transactional
        @Modifying
        @Query("DELETE FROM Event e WHERE e.organizerId = :organizerId")
        void deleteByOrganizerId(@Param("organizerId") Long organizerId);
}

// ================================================================
// USAGE NOTES:
//
// ✔ Venue availability → findConflictingEvents()
// ✔ Admin calendar → findEventsForCalendar()
// ✔ Month/week view → findEventsOverlappingDateRange()
// ✔ Venue analytics → countByVenueId()
//
// ================================================================
