// ================================================================
// FILE: Reminder.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/entity/
// Description: Reminder entity for event notifications
// ================================================================

package com.eventzen.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "reminders", uniqueConstraints = @UniqueConstraint(columnNames = { "user_id", "event_id" }))
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    // Has reminder email been sent?
    @Column(name = "reminder_sent")
    private Boolean reminderSent = false;

    // When was reminder sent?
    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    // When was reminder created?
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    // Auto-set creation timestamp
    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.reminderSent == null) {
            this.reminderSent = false;
        }
    }

    // Constructors
    public Reminder() {
    }

    public Reminder(User user, Event event) {
        this.user = user;
        this.event = event;
        this.reminderSent = false;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public Boolean getReminderSent() {
        return reminderSent;
    }

    public void setReminderSent(Boolean reminderSent) {
        this.reminderSent = reminderSent;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // Utility methods
    public void markAsSent() {
        this.reminderSent = true;
        this.sentAt = LocalDateTime.now();
    }

    public boolean shouldSendReminder() {
        // Only send if not already sent
        if (this.reminderSent != null && this.reminderSent) {
            return false;
        }

        // Check if event is tomorrow
        LocalDateTime eventStart = LocalDateTime.of(
                event.getStartDate(),
                event.getStartTime());
        LocalDateTime tomorrow = LocalDateTime.now().plusDays(1);

        // Send if event is within 24-48 hours
        return eventStart.isAfter(tomorrow.minusHours(24)) &&
                eventStart.isBefore(tomorrow.plusHours(24));
    }

    @Override
    public String toString() {
        return "Reminder{" +
                "id=" + id +
                ", userId=" + (user != null ? user.getId() : null) +
                ", eventId=" + (event != null ? event.getId() : null) +
                ", reminderSent=" + reminderSent +
                ", createdAt=" + createdAt +
                '}';
    }
}

// ================================================================
// USAGE NOTES:
// - Unique constraint: One reminder per user per event
// - reminderSent: Prevents duplicate reminder emails
// - shouldSendReminder(): Logic to check if reminder should be sent
// - Scheduler calls markAsSent() after sending email
// ================================================================