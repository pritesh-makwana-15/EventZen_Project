// ================================================================
// FILE: EventZen-backend/eventzen/src/main/java/com/eventzen/repository/EventRepository.java
// CHANGES: Added ORDER BY DESC for date descending (newest first)
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

    // ==================== UPDATED: DATE DESCENDING (NEWEST FIRST)
    // ====================

    /**
     * Find all events by organizer - SORTED BY DATE DESC
     */
    List<Event> findByOrganizerIdOrderByDateDesc(Long organizerId);

    /**
     * Find upcoming events for organizer (date >= today) - SORTED BY DATE DESC
     */
    List<Event> findByOrganizerIdAndDateGreaterThanEqualOrderByDateDesc(Long organizerId, LocalDate date);

    /**
     * Find past events for organizer (date < today) - SORTED BY DATE DESC
     */
    List<Event> findByOrganizerIdAndDateLessThanOrderByDateDesc(Long organizerId, LocalDate date);

    // ==================== OTHER METHODS (UNCHANGED) ====================

    /**
     * Find all events by organizer (no sorting - for backward compatibility)
     */
    List<Event> findByOrganizerId(Long organizerId);

    /**
     * Find all active events
     */
    List<Event> findByIsActiveTrue();

    /**
     * Find events by category
     */
    List<Event> findByCategory(String category);

    /**
     * Custom query to find events by organizer within a date range
     */
    @Query("SELECT e FROM Event e WHERE e.organizerId = :organizerId AND e.date BETWEEN :startDate AND :endDate ORDER BY e.date DESC")
    List<Event> findByOrganizerIdAndDateBetween(
            @Param("organizerId") Long organizerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    /**
     * Find only public and active events - SORTED BY DATE DESC
     */
    @Query("SELECT e FROM Event e WHERE e.eventType = 'PUBLIC' AND e.isActive = true ORDER BY e.date DESC")
    List<Event> findPublicEvents();

    /**
     * Count total events by organizer
     */
    long countByOrganizerId(Long organizerId);

    /**
     * Count upcoming events by organizer
     */
    long countByOrganizerIdAndDateGreaterThanEqual(Long organizerId, LocalDate date);

    /**
     * Delete all events for a specific organizer (CASCADE FIX)
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM Event e WHERE e.organizerId = :organizerId")
    void deleteByOrganizerId(@Param("organizerId") Long organizerId);
}