// ================================================================
// FILE: RegistrationRepository.java
// Location: src/main/java/com/eventzen/repository/
// STATUS: ✅ MERGED (Old + New) – All features working
// ================================================================

package com.eventzen.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.RegistrationStatus;
import com.eventzen.entity.User;

/**
 * ✅ Registration Repository
 * 
 * ✔ Old features preserved
 * ✔ New Organizer Dashboard features added
 * ✔ Supports Analytics, Pagination, CSV Export
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // ================================================================
    // 🔹 EXISTING / OLD METHODS (DO NOT BREAK)
    // ================================================================

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

    // Count registrations for a specific event (by entity)
    long countByEvent(Event event);

    // Count registrations for a specific event (by event ID)
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    // Count registrations for a specific user
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.visitor.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    /**
     * 🟢 Find registrations from last 6 months (Analytics / Monthly trends)
     */
    @Query("""
                SELECT r FROM Registration r
                WHERE r.registeredAt >= :startDate
                ORDER BY r.registeredAt DESC
            """)
    List<Registration> findRegistrationsInLast6Months(
            @Param("startDate") LocalDateTime startDate);

    // ================================================================
    // 🆕 NEW METHODS – ORGANIZER DASHBOARD FEATURES
    // ================================================================

    /**
     * ✔ Paginated registrations for an event
     * Used in: Organizer → View Registrations
     */
    Page<Registration> findByEventIdOrderByRegisteredAtDesc(
            Long eventId,
            Pageable pageable);

    /**
     * ✔ All registrations for an event (No pagination)
     * Used in: CSV Export
     */
    @Query("""
                SELECT r FROM Registration r
                WHERE r.event.id = :eventId
                ORDER BY r.registeredAt DESC
            """)
    List<Registration> findByEventIdOrderByRegisteredAtDesc(
            @Param("eventId") Long eventId);

    /**
     * ✔ Count registrations by event & status
     * Used in: Organizer analytics (Confirmed / Cancelled)
     */
    @Query("""
                SELECT COUNT(r) FROM Registration r
                WHERE r.event.id = :eventId
                AND r.status = :status
            """)
    long countByEventIdAndStatus(
            @Param("eventId") Long eventId,
            @Param("status") RegistrationStatus status);

    /**
     * ✔ Fetch registrations for multiple events
     * Used in: Organizer / Admin analytics
     */
    @Query("""
                SELECT r FROM Registration r
                WHERE r.event.id IN :eventIds
            """)
    List<Registration> findByEventIdIn(
            @Param("eventIds") List<Long> eventIds);
}
