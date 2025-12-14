// ================================================================
// FILE 2: FeedbackRepository.java
// ================================================================
package com.eventzen.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.eventzen.entity.Feedback;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByEventId(Long eventId);
    List<Feedback> findByUserId(Long userId);
    List<Feedback> findByIsReviewedFalse();
    List<Feedback> findByIsFlaggedTrue();
    
    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.event.id = :eventId")
    Double getAverageRatingByEventId(@Param("eventId") Long eventId);
    
    long countByEventId(Long eventId);
}