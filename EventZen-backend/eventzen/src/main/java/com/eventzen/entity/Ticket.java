// ================================================================
// FILE: Ticket.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/entity/
// Description: Ticket entity for visitor registrations
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
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "tickets")
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // One ticket per registration
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_id", nullable = false, unique = true)
    private Registration registration;

    // Unique ticket code for QR generation
    @Column(name = "ticket_code", nullable = false, unique = true, length = 100)
    private String ticketCode;

    // QR code data (base64 or path)
    @Column(name = "qr_code_data", columnDefinition = "TEXT")
    private String qrCodeData;

    // Issue timestamp
    @Column(name = "issued_at", nullable = false)
    private LocalDateTime issuedAt;

    // Check-in status
    @Column(name = "is_checked_in")
    private Boolean isCheckedIn = false;

    @Column(name = "checked_in_at")
    private LocalDateTime checkedInAt;

    // Auto-set issue timestamp
    @PrePersist
    protected void onCreate() {
        if (this.issuedAt == null) {
            this.issuedAt = LocalDateTime.now();
        }
        if (this.isCheckedIn == null) {
            this.isCheckedIn = false;
        }
    }

    // Constructors
    public Ticket() {
    }

    public Ticket(Registration registration, String ticketCode, String qrCodeData) {
        this.registration = registration;
        this.ticketCode = ticketCode;
        this.qrCodeData = qrCodeData;
        this.issuedAt = LocalDateTime.now();
        this.isCheckedIn = false;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Registration getRegistration() {
        return registration;
    }

    public void setRegistration(Registration registration) {
        this.registration = registration;
    }

    public String getTicketCode() {
        return ticketCode;
    }

    public void setTicketCode(String ticketCode) {
        this.ticketCode = ticketCode;
    }

    public String getQrCodeData() {
        return qrCodeData;
    }

    public void setQrCodeData(String qrCodeData) {
        this.qrCodeData = qrCodeData;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(LocalDateTime issuedAt) {
        this.issuedAt = issuedAt;
    }

    public Boolean getIsCheckedIn() {
        return isCheckedIn;
    }

    public void setIsCheckedIn(Boolean isCheckedIn) {
        this.isCheckedIn = isCheckedIn;
    }

    public LocalDateTime getCheckedInAt() {
        return checkedInAt;
    }

    public void setCheckedInAt(LocalDateTime checkedInAt) {
        this.checkedInAt = checkedInAt;
    }

    // Utility methods
    public void checkIn() {
        this.isCheckedIn = true;
        this.checkedInAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Ticket{" +
                "id=" + id +
                ", ticketCode='" + ticketCode + '\'' +
                ", isCheckedIn=" + isCheckedIn +
                ", issuedAt=" + issuedAt +
                '}';
    }
}

// ================================================================
// USAGE NOTES:
// - ticketCode: Unique code like "TKT-{eventId}-{registrationId}-{timestamp}"
// - qrCodeData: Base64 encoded QR image or URL
// - One-to-One with Registration (one ticket per registration)
// - isCheckedIn: Used for event check-in functionality
// ================================================================