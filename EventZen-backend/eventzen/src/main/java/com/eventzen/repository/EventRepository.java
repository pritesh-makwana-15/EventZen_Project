// ================================================================
// FILE: D:\EventZen-backend\eventzen\src\main\java\com\eventzen\repository\EventRepository.java
// 🆕 UPDATED: Added calendar-specific query methods
// This is the COMPLETE file with all queries
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
        // Core Methods - Using startDate/endDate
        // ====================

        /**
         * Find all events by organizer - SORTED BY START DATE DESC
         */
        List<Event> findByOrganizerIdOrderByStartDateDesc(Long organizerId);

        /**
         * Find upcoming events for organizer (startDate >= today) - SORTED BY START
         * DATE DESC
         */
        List<Event> findByOrganizerIdAndStartDateGreaterThanEqualOrderByStartDateDesc(Long organizerId, LocalDate date);

        /**
         * Find past events for organizer (endDate < today) - SORTED BY END DATE DESC
         */
        List<Event> findByOrganizerIdAndEndDateLessThanOrderByEndDateDesc(Long organizerId, LocalDate date);

        /**
         * Find all events by organizer (no sorting)
         */
        List<Event> findByOrganizerId(Long organizerId);

        /**
         * Find all active events sorted by start date
         */
        List<Event> findByIsActiveTrueOrderByStartDateDesc();

        /**
         * Find events by category (case insensitive)
         */
        List<Event> findByCategoryIgnoreCase(String category);

        /**
         * Find events by category (exact match)
         */
        List<Event> findByCategory(String category);

        /**
         * Find by event type
         */
        List<Event> findByEventType(String eventType);

        /**
         * Custom query to find events by organizer within a date range
         */
        @Query("SELECT e FROM Event e WHERE e.organizerId = :organizerId " +
                        "AND e.startDate BETWEEN :startDate AND :endDate " +
                        "ORDER BY e.startDate DESC")
        List<Event> findByOrganizerIdAndDateBetween(
                        @Param("organizerId") Long organizerId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Find only public and active events - SORTED BY START DATE DESC
         */
        @Query("SELECT e FROM Event e WHERE e.eventType = 'PUBLIC' " +
                        "AND e.isActive = true ORDER BY e.startDate DESC")
        List<Event> findPublicEvents();

        // ====================
        // 🆕 NEW: Calendar-Specific Queries
        // ====================

        /**
         * Find events starting between two dates (for calendar view)
         * This includes events that start within the visible calendar range
         */
        List<Event> findByStartDateBetween(LocalDate startDate, LocalDate endDate);

        /**
         * Find events starting after a specific date
         */
        List<Event> findByStartDateAfter(LocalDate date);

        /**
         * Find events ending before a specific date
         */
        List<Event> findByEndDateBefore(LocalDate date);

        /**
         * 🆕 NEW: Find events that overlap with a date range
         * This catches events that:
         * - Start before the range but end during it
         * - Start during the range
         * - Start before and end after the range
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
         * 🆕 NEW: Find events by city
         */
        List<Event> findByCity(String city);

        /**
         * 🆕 NEW: Find events by state
         */
        List<Event> findByState(String state);

        /**
         * 🆕 NEW: Complex calendar query with all filters
         */
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

        /**
         * Count total events by organizer
         */
        long countByOrganizerId(Long organizerId);

        /**
         * Count upcoming events by organizer
         */
        long countByOrganizerIdAndStartDateGreaterThanEqual(Long organizerId, LocalDate date);

        /**
         * 🆕 NEW: Count events by category
         */
        long countByCategory(String category);

        /**
         * 🆕 NEW: Count events by city
         */
        long countByCity(String city);

        // ====================
        // Delete Methods
        // ====================

        /**
         * Delete all events for a specific organizer (CASCADE FIX)
         */
        @Transactional
        @Modifying
        @Query("DELETE FROM Event e WHERE e.organizerId = :organizerId")
        void deleteByOrganizerId(@Param("organizerId") Long organizerId);
}

// ================================================================
// USAGE NOTES:
//
// For calendar implementation, use:
// - findByStartDateBetween() for simple month/week/day views
// - findEventsOverlappingDateRange() for more accurate results
// - findEventsForCalendar() for admin dashboard with all filters
//
// ================================================================