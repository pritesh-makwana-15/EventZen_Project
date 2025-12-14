package com.eventzen.service;

import java.util.List;
import com.eventzen.dto.response.FeedbackResponse;

public interface FeedbackService {
    List<FeedbackResponse> getAllFeedback();
    List<FeedbackResponse> getUnreviewedFeedback();
    List<FeedbackResponse> getFlaggedFeedback();
    void deleteFeedback(Long feedbackId) throws Exception;
    FeedbackResponse markAsReviewed(Long feedbackId) throws Exception;
    FeedbackResponse flagFeedback(Long feedbackId) throws Exception;
}
