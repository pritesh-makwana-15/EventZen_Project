// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/repository/EventRepository.java
// FIXED: Removed all references to 'date' field, using startDate/endDate only
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

    /**
     * Find events starting between two dates
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