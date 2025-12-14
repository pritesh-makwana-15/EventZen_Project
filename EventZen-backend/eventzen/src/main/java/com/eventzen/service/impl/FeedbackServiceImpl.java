package com.eventzen.service.impl;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.eventzen.dto.response.FeedbackResponse;
import com.eventzen.entity.Feedback;
import com.eventzen.repository.FeedbackRepository;
import com.eventzen.service.FeedbackService;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Override
    public List<FeedbackResponse> getAllFeedback() {
        return feedbackRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getUnreviewedFeedback() {
        return feedbackRepository.findByIsReviewedFalse().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<FeedbackResponse> getFlaggedFeedback() {
        return feedbackRepository.findByIsFlaggedTrue().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteFeedback(Long feedbackId) throws Exception {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new Exception("Feedback not found"));
        feedbackRepository.delete(feedback);
    }

    @Override
    public FeedbackResponse markAsReviewed(Long feedbackId) throws Exception {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new Exception("Feedback not found"));
        feedback.setIsReviewed(true);
        Feedback updated = feedbackRepository.save(feedback);
        return convertToResponse(updated);
    }

    @Override
    public FeedbackResponse flagFeedback(Long feedbackId) throws Exception {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new Exception("Feedback not found"));
        feedback.setIsFlagged(true);
        Feedback updated = feedbackRepository.save(feedback);
        return convertToResponse(updated);
    }

    private FeedbackResponse convertToResponse(Feedback feedback) {
        FeedbackResponse response = new FeedbackResponse();
        response.setId(feedback.getId());
        response.setEventId(feedback.getEvent().getId());
        response.setEventTitle(feedback.getEvent().getTitle());
        response.setUserId(feedback.getUser().getId());
        response.setUserName(feedback.getUser().getName());
        response.setRating(feedback.getRating());
        response.setComment(feedback.getComment());
        response.setIsReviewed(feedback.getIsReviewed());
        response.setIsFlagged(feedback.getIsFlagged());
        response.setCreatedAt(feedback.getCreatedAt());
        return response;
    }
}