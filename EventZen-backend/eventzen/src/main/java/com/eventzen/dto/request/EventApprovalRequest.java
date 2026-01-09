// ================================================================
// FILE: EventApprovalRequest.java
// Location: src/main/java/com/eventzen/dto/request/EventApprovalRequest.java
// Purpose: DTO for admin event approval/rejection requests
// ================================================================

package com.eventzen.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for Event Approval Actions
 * Used when admin approves or rejects events
 */
public class EventApprovalRequest {

    /**
     * Action to perform: "APPROVE" or "REJECT"
     */
    @NotBlank(message = "Action is required")
    private String action;

    /**
     * Rejection reason (required only when action = REJECT)
     */
    @Size(max = 1000, message = "Rejection reason cannot exceed 1000 characters")
    private String rejectionReason;

    // ================================================================
    // Constructors
    // ================================================================

    public EventApprovalRequest() {
    }

    public EventApprovalRequest(String action, String rejectionReason) {
        this.action = action;
        this.rejectionReason = rejectionReason;
    }

    // ================================================================
    // Getters and Setters
    // ================================================================

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    // ================================================================
    // Helper Methods
    // ================================================================

    public boolean isApprove() {
        return "APPROVE".equalsIgnoreCase(action);
    }

    public boolean isReject() {
        return "REJECT".equalsIgnoreCase(action);
    }

    // ================================================================
    // toString for debugging
    // ================================================================

    @Override
    public String toString() {
        return "EventApprovalRequest{" +
                "action='" + action + '\'' +
                ", rejectionReason='" + rejectionReason + '\'' +
                '}';
    }
}