// ================================================================
// FILE: ReminderRepository.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/repository/
// Description: Repository for Reminder entity operations
// ================================================================

package com.eventzen.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.eventzen.entity.Event;
import com.eventzen.entity.Reminder;
import com.eventzen.entity.User;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    /**
     * Find reminder by user and event
     * Used to check if reminder already exists
     */
    Optional<Reminder> findByUserAndEvent(User user, Event event);

    /**
     * Find reminder by user ID and event ID
     * More convenient than loading full entities
     */
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId AND r.event.id = :eventId")
    Optional<Reminder> findByUserIdAndEventId(
            @Param("userId") Long userId,
            @Param("eventId") Long eventId);

    /**
     * Find all reminders for a specific user
     * Used in "My Reminders" page
     */
    @Query("SELECT r FROM Reminder r WHERE r.user.id = :userId ORDER BY r.event.startDate ASC")
    List<Reminder> findByUserId(@Param("userId") Long userId);

    /**
     * Find all unsent reminders for events happening tomorrow
     * Used by scheduled job to send reminder emails
     * 
     * Logic: Event start date is tomorrow AND reminder not yet sent
     */
    @Query("""
        SELECT r FROM Reminder r
        WHERE r.reminderSent = false
        AND r.event.startDate = :tomorrowDate
        ORDER BY r.event.startTime ASC
    """)
    List<Reminder> findUnsentRemindersForDate(@Param("tomorrowDate") LocalDate tomorrowDate);

    /**
     * Check if reminder exists for user and event
     * Prevents duplicate reminders
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reminder r WHERE r.user.id = :userId AND r.event.id = :eventId")
    boolean existsByUserIdAndEventId(
            @Param("userId") Long userId,
            @Param("eventId") Long eventId);

    /**
     * Count reminders for a specific event
     * Used in event analytics
     */
    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.event.id = :eventId")
    long countByEventId(@Param("eventId") Long eventId);

    /**
     * Delete all reminders for a specific event
     * Used when event is deleted
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM Reminder r WHERE r.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);

    /**
     * Delete all reminders for a specific user
     * Used when user account is deleted
     */
    @Transactional
    @Modifying
    @Query("DELETE FROM Reminder r WHERE r.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    /**
     * Find all reminders for past events (cleanup)
     * Used to clean up old reminders
     */
    @Query("SELECT r FROM Reminder r WHERE r.event.endDate < :currentDate")
    List<Reminder> findRemindersForPastEvents(@Param("currentDate") LocalDate currentDate);
}

// ================================================================
// USAGE NOTES:
// - findUnsentRemindersForDate(): Called by ReminderScheduler daily
// - existsByUserIdAndEventId(): Prevents duplicate reminders
// - findByUserId(): Shows user's active reminders
// - Cleanup methods: Remove old reminders for past events
// ================================================================