package com.eventzen.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eventzen.entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Find events by organizer
    List<Event> findByOrganizerId(Long organizerId);

    // Find upcoming events for organizer (date >= today)
    List<Event> findByOrganizerIdAndDateGreaterThanEqualOrderByDateAsc(Long organizerId, LocalDate date);

    // Find past events for organizer (date < today)
    List<Event> findByOrganizerIdAndDateLessThanOrderByDateDesc(Long organizerId, LocalDate date);

    // Find all active events
    List<Event> findByIsActiveTrue();

    // Find events by category
    List<Event> findByCategory(String category);

    // Custom query to find events by organizer with date range
    @Query("SELECT e FROM Event e WHERE e.organizerId = :organizerId AND e.date BETWEEN :startDate AND :endDate ORDER BY e.date ASC")
    List<Event> findByOrganizerIdAndDateBetween(@Param("organizerId") Long organizerId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    // Find public events only
    @Query("SELECT e FROM Event e WHERE e.eventType = 'PUBLIC' AND e.isActive = true ORDER BY e.date ASC")
    List<Event> findPublicEvents();

    // Count events by organizer
    long countByOrganizerId(Long organizerId);

    // Count upcoming events by organizer
    long countByOrganizerIdAndDateGreaterThanEqual(Long organizerId, LocalDate date);
}