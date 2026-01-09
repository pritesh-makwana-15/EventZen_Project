// ================================================================
// FILE: EventStatus.java
// Location: src/main/java/com/eventzen/entity/EventStatus.java
// Purpose: Enum for event approval status workflow
// ================================================================

package com.eventzen.entity;

/**
 * Event Status Enum
 * 
 * PENDING - Event created by organizer, awaiting admin approval
 * APPROVED - Admin approved, event is visible to visitors
 * REJECTED - Admin rejected, organizer can see reason and resubmit
 */
public enum EventStatus {
    PENDING,
    APPROVED,
    REJECTED
}