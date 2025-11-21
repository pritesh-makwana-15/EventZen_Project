package com.eventzen.repository;

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
 * UPDATED: Added deletion methods to prevent FK constraint violations
 * 
 * Changes:
 * - Added deleteByEvent() for cascade deletion when event is deleted
 * - Added deleteByVisitor() for cascade deletion when visitor is deleted
 * - Added countByEvent() to check registration count before event deletion
 * - All deletion methods are @Transactional and @Modifying
 */
@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {

    // Existing methods
    List<Registration> findByVisitor(User visitor);

    List<Registration> findByEvent(Event event);

    // NEW: Delete all registrations for a specific event (for event deletion)
    @Transactional
    @Modifying
    @Query("DELETE FROM Registration r WHERE r.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);

    // NEW: Delete all registrations for a specific user (for visitor deletion)
    @Transactional
    @Modifying
    @Query("DELETE FROM Registration r WHERE r.visitor.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    // NEW: Count registrations for an event (to show warning in delete modal)
    long countByEvent(Event event);

    // NEW: Count registrations by event ID
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    // NEW: Count registrations by user ID
    @Query("SELECT COUNT(r) FROM Registration r WHERE r.visitor.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    
}