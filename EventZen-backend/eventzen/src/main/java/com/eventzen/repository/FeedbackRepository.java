// ================================================================
// FILE: FeedbackRepository.java
// Location: src/main/java/com/eventzen/repository/
// MERGED: Old + New (All features preserved)
// ================================================================

package com.eventzen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eventzen.entity.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {

    // ===================== BASIC FETCH METHODS =====================

    // Get all feedback for an event
    List<Feedback> findByEventId(Long eventId);

    // Get all feedback by a user
    List<Feedback> findByUserId(Long userId);

    // Get feedback pending review (Admin/Moderator)
    List<Feedback> findByIsReviewedFalse();

    // Get flagged feedback
    List<Feedback> findByIsFlaggedTrue();

    // ===================== ANALYTICS & COUNTS =====================

    // Average rating for an event
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.event.id = :eventId")
    Double getAverageRatingByEventId(@Param("eventId") Long eventId);

    // Total feedback count for an event
    long countByEventId(Long eventId);

    // ===================== 🆕 VALIDATION & DUPLICATE CHECKS =====================

    // Check if a user already submitted feedback for an event
    @Query("""
                SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END
                FROM Feedback f
                WHERE f.event.id = :eventId AND f.user.id = :userId
            """)
    boolean existsByEventIdAndUserId(
            @Param("eventId") Long eventId,
            @Param("userId") Long userId);

    // Fetch feedback by event + user (for edit/view)
    @Query("""
                SELECT f FROM Feedback f
                WHERE f.event.id = :eventId AND f.user.id = :userId
            """)
    Optional<Feedback> findByEventIdAndUserId(
            @Param("eventId") Long eventId,
            @Param("userId") Long userId);
}
