// ================================================================
// FILE 3: AdminFeedbackController.java
// ================================================================
package com.eventzen.controller;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.eventzen.dto.response.FeedbackResponse;
import com.eventzen.service.FeedbackService;

@RestController
@RequestMapping("/api/admin/feedback")
@PreAuthorize("hasRole('ADMIN')")
public class AdminFeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> getAllFeedback() {
        List<FeedbackResponse> feedback = feedbackService.getAllFeedback();
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/unreviewed")
    public ResponseEntity<List<FeedbackResponse>> getUnreviewedFeedback() {
        List<FeedbackResponse> feedback = feedbackService.getUnreviewedFeedback();
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/flagged")
    public ResponseEntity<List<FeedbackResponse>> getFlaggedFeedback() {
        List<FeedbackResponse> feedback = feedbackService.getFlaggedFeedback();
        return ResponseEntity.ok(feedback);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFeedback(@PathVariable Long id) {
        try {
            feedbackService.deleteFeedback(id);
            return ResponseEntity.ok("Feedback deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<?> markAsReviewed(@PathVariable Long id) {
        try {
            FeedbackResponse feedback = feedbackService.markAsReviewed(id);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{id}/flag")
    public ResponseEntity<?> flagFeedback(@PathVariable Long id) {
        try {
            FeedbackResponse feedback = feedbackService.flagFeedback(id);
            return ResponseEntity.ok(feedback);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}
