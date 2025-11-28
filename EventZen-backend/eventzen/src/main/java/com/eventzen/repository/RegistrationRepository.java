package com.eventzen.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.User;

/**
 * ✅ UPDATED Registration Repository
 * 
 * Added: findRegistrationsInLast6Months() for monthly trends
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Find registrations for a given visitor
    List<Registration> findByVisitor(User visitor);

    // Find registrations for a given event
    List<Registration> findByEvent(Event event);

    // Delete all registrations for a specific event
    @Transactional
    @Modifying
    @Query("DELETE FROM Registration r WHERE r.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);

    // Delete all registrations for a specific user
    @Transactional
    @Modifying
    @Query("DELETE FROM Registration r WHERE r.visitor.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    // Count registrations for a specific event (by Event entity)
    long countByEvent(Event event);

    // Count registrations for a specific event (by event id)
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    // Count registrations for a specific user id
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.visitor.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 🆕 NEW: Find registrations in last 6 months (for monthly trends)
     * Uses registeredAt field to group by registration date
     */
    @Query("SELECT r FROM Registration r WHERE r.registeredAt >= :startDate ORDER BY r.registeredAt DESC")
    List<Registration> findRegistrationsInLast6Months(@Param("startDate") LocalDateTime startDate);
}