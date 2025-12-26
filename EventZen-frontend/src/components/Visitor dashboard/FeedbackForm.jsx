// ================================================================
// FILE: src/components/Visitor dashboard/FeedbackForm.jsx
// PURPOSE: Submit event feedback (rating + comment)
// ================================================================

import React, { useState, useEffect } from "react";
import { Star, Send, CheckCircle, X } from "lucide-react";
import { submitFeedback, getEventFeedback } from "../../services/visitorService";

export default function FeedbackForm({ event, onClose, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Check if event has ended
  const eventEnded = () => {
    if (!event.endDate || !event.endTime) return false;
    const eventEndDateTime = new Date(`${event.endDate}T${event.endTime}`);
    return eventEndDateTime < new Date();
  };

  // Check if user already submitted feedback
  useEffect(() => {
    const checkExistingFeedback = async () => {
      try {
        const feedbacks = await getEventFeedback(event.id);
        // Backend should only return user's own feedback or filter by user
        if (feedbacks && feedbacks.length > 0) {
          setAlreadySubmitted(true);
        }
      } catch (err) {
        console.error("Error checking feedback:", err);
      }
    };

    if (event.id) {
      checkExistingFeedback();
    }
  }, [event.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!eventEnded()) {
      setError("Feedback can only be submitted after the event ends");
      return;
    }

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await submitFeedback(event.id, {
        rating,
        comment: comment.trim() || null,
      });

      if (onSuccess) {
        onSuccess("Feedback submitted successfully!");
      }

      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to submit feedback";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Don't show form if event hasn't ended
  if (!eventEnded()) {
    return (
      <div className="vis-feedback-unavailable">
        <p>Feedback will be available after the event ends</p>
        <p style={{ fontSize: "12px", color: "#666" }}>
          Event ends: {event.endDate} at {event.endTime}
        </p>
      </div>
    );
  }

  // Show message if already submitted
  if (alreadySubmitted) {
    return (
      <div className="vis-feedback-submitted">
        <CheckCircle size={40} color="#4caf50" />
        <p>You have already submitted feedback for this event</p>
      </div>
    );
  }

  return (
    <div className="vis-feedback-form-container">
      <div className="vis-feedback-form-header">
        <h3>Rate Your Experience</h3>
        {onClose && (
          <button onClick={onClose} className="vis-feedback-close">
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="vis-feedback-form">
        {error && (
          <div className="vis-feedback-error">
            {error}
          </div>
        )}

        {/* Star Rating */}
        <div className="vis-rating-section">
          <label className="vis-form-label">Rating *</label>
          <div className="vis-star-rating">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="vis-star-button"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={32}
                  fill={star <= (hoveredRating || rating) ? "#fbbf24" : "none"}
                  color={star <= (hoveredRating || rating) ? "#fbbf24" : "#d1d5db"}
                  style={{ transition: "all 0.2s" }}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="vis-rating-text">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          )}
        </div>

        {/* Comment */}
        <div className="vis-form-group">
          <label className="vis-form-label">Your Feedback (Optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this event..."
            className="vis-form-textarea"
            rows="4"
            maxLength="500"
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            {comment.length}/500 characters
          </small>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || rating === 0}
          className="vis-btn vis-btn-primary-visitor"
          style={{ width: "100%" }}
        >
          {loading ? (
            "Submitting..."
          ) : (
            <>
              <Send size={16} />
              Submit Feedback
            </>
          )}
        </button>
      </form>

      <style jsx>{`
        .vis-feedback-form-container {
          background: white;
          border-radius: 12px;
          padding: 20px;
        }

        .vis-feedback-form-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .vis-feedback-form-header h3 {
          margin: 0;
          font-size: 20px;
          color: #333;
        }

        .vis-feedback-close {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          color: #666;
        }

        .vis-feedback-close:hover {
          color: #333;
        }

        .vis-feedback-error {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          border-left: 3px solid #c33;
          font-size: 14px;
        }

        .vis-rating-section {
          margin-bottom: 20px;
        }

        .vis-star-rating {
          display: flex;
          gap: 8px;
          margin-top: 8px;
        }

        .vis-star-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: transform 0.2s;
        }

        .vis-star-button:hover {
          transform: scale(1.1);
        }

        .vis-rating-text {
          margin-top: 8px;
          font-size: 14px;
          color: #fbbf24;
          font-weight: 600;
        }

        .vis-feedback-unavailable,
        .vis-feedback-submitted {
          text-align: center;
          padding: 40px 20px;
          color: #666;
        }

        .vis-feedback-submitted {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}