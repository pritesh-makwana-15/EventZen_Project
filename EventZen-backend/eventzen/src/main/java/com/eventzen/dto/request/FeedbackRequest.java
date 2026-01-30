// ================================================================
// FILE: FeedbackRequest.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/dto/request/
// ================================================================

package com.eventzen.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class FeedbackRequest {

    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be between 1 and 5")
    @Max(value = 5, message = "Rating must be between 1 and 5")
    private Integer rating;

    private String comment;

    // Constructors
    public FeedbackRequest() {}

    public FeedbackRequest(Integer rating, String comment) {
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    @Override
    public String toString() {
        return "FeedbackRequest{" +
                "rating=" + rating +
                ", comment='" + comment + '\'' +
                '}';
    }
}