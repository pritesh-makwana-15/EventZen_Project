// ================================================================
// FILE 2: src/pages/admin/FeedbackModeration.jsx
// ================================================================

import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Trash2, Check, Flag, Filter, 
  Star, Loader, AlertCircle 
} from "lucide-react";
import {
  getAllFeedback,
  getUnreviewedFeedback,
  getFlaggedFeedback,
  deleteFeedback,
  markFeedbackAsReviewed,
  flagFeedback as flagFeedbackApi,
} from "../../services/adminService";
// import "../../styles/Admin Dashboard/Feedback.css";
import "../../styles/Admin Dashborad/Feedback.css";

export default function FeedbackModeration() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filter, setFilter] = useState("all"); // all, unreviewed, flagged

  useEffect(() => {
    loadFeedback();
  }, [filter]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      let data;
      
      switch (filter) {
        case "unreviewed":
          data = await getUnreviewedFeedback();
          break;
        case "flagged":
          data = await getFlaggedFeedback();
          break;
        default:
          data = await getAllFeedback();
      }
      
      setFeedbacks(data);
      setFilteredFeedbacks(data);
    } catch (err) {
      setError("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (feedbackId) => {
    if (!window.confirm("Are you sure you want to delete this feedback?")) {
      return;
    }

    try {
      await deleteFeedback(feedbackId);
      setSuccess("Feedback deleted successfully");
      loadFeedback();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to delete feedback");
    }
  };

  const handleMarkReviewed = async (feedbackId) => {
    try {
      await markFeedbackAsReviewed(feedbackId);
      setSuccess("Marked as reviewed");
      loadFeedback();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to mark as reviewed");
    }
  };

  const handleFlag = async (feedbackId) => {
    try {
      await flagFeedbackApi(feedbackId);
      setSuccess("Feedback flagged");
      loadFeedback();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to flag feedback");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "star-filled" : "star-empty"}
        fill={i < rating ? "#fbbf24" : "none"}
      />
    ));
  };

  if (loading) {
    return (
      <div className="feedback-loading">
        <Loader className="spinner" size={48} />
        <p>Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="feedback-container">
      <div className="feedback-header">
        <div className="header-left">
          <MessageSquare size={32} />
          <div>
            <h1>Feedback Moderation</h1>
            <p>{filteredFeedbacks.length} feedback entries</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {success && <div className="alert alert-success">{success}</div>}

      {/* Filters */}
      <div className="feedback-filters">
        <button
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Feedback
        </button>
        <button
          className={`filter-btn ${filter === "unreviewed" ? "active" : ""}`}
          onClick={() => setFilter("unreviewed")}
        >
          Unreviewed
        </button>
        <button
          className={`filter-btn ${filter === "flagged" ? "active" : ""}`}
          onClick={() => setFilter("flagged")}
        >
          <Flag size={16} /> Flagged
        </button>
      </div>

      {/* Feedback List */}
      <div className="feedback-list">
        {filteredFeedbacks.map((fb) => (
          <div
            key={fb.id}
            className={`feedback-card ${fb.isFlagged ? "flagged" : ""} ${
              fb.isReviewed ? "reviewed" : ""
            }`}
          >
            <div className="feedback-header-card">
              <div className="feedback-user">
                <div className="user-avatar">
                  {fb.userName?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{fb.userName}</h4>
                  <p className="event-title">{fb.eventTitle}</p>
                </div>
              </div>

              <div className="feedback-rating">{renderStars(fb.rating)}</div>
            </div>

            <div className="feedback-body">
              <p>{fb.comment}</p>
            </div>

            <div className="feedback-footer">
              <div className="feedback-badges">
                {fb.isReviewed && (
                  <span className="badge badge-reviewed">
                    <Check size={14} /> Reviewed
                  </span>
                )}
                {fb.isFlagged && (
                  <span className="badge badge-flagged">
                    <Flag size={14} /> Flagged
                  </span>
                )}
              </div>

              <div className="feedback-actions">
                {!fb.isReviewed && (
                  <button
                    className="btn-icon btn-check"
                    onClick={() => handleMarkReviewed(fb.id)}
                    title="Mark as Reviewed"
                  >
                    <Check size={18} />
                  </button>
                )}

                {!fb.isFlagged && (
                  <button
                    className="btn-icon btn-flag"
                    onClick={() => handleFlag(fb.id)}
                    title="Flag as Inappropriate"
                  >
                    <Flag size={18} />
                  </button>
                )}

                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(fb.id)}
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredFeedbacks.length === 0 && (
        <div className="no-feedback">
          <MessageSquare size={64} />
          <p>No feedback to display</p>
        </div>
      )}
    </div>
  );
}