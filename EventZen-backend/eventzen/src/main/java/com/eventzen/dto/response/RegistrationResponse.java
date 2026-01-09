// ================================================================
// FILE: RegistrationResponse.java (UPDATED)
// Location: src/main/java/com/eventzen/dto/response/
// STATUS: ✅ FIXED - Added hasTicket field
// CHANGES: 
//   - Added Boolean hasTicket field
//   - Updated constructors to support new field
//   - Backward compatible with existing code
// ================================================================

package com.eventzen.dto.response;

import java.time.LocalDateTime;

import com.eventzen.entity.RegistrationStatus;

/**
 * ✅ Registration Response DTO (UPDATED)
 * 
 * ✔ Old fields preserved
 * ✔ New fields added for Organizer Dashboard
 * ✔ 🆕 hasTicket field added for ticket download feature
 * ✔ Safe for existing APIs
 */
public class RegistrationResponse {

    // ===============================
    // 🔹 OLD FIELDS (DO NOT BREAK)
    // ===============================
    private Long id;
    private Long eventId;
    private Long visitorId;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;

    // ===============================
    // 🆕 NEW FIELDS
    // ===============================
    private String visitorName;
    private String visitorEmail;
    private String phone;
    private String notes;
    
    // 🎫 NEW: Ticket availability flag
    private Boolean hasTicket;

    // ===============================
    // CONSTRUCTORS
    // ===============================

    // Default constructor
    public RegistrationResponse() {
    }

    /**
     * ✔ OLD constructor (kept for backward compatibility)
     */
    public RegistrationResponse(
            Long id,
            Long eventId,
            Long visitorId,
            RegistrationStatus status,
            LocalDateTime registeredAt) {
        this.id = id;
        this.eventId = eventId;
        this.visitorId = visitorId;
        this.status = status;
        this.registeredAt = registeredAt;
        this.hasTicket = false; // Default to false
    }

    /**
     * 🆕 NEW constructor (Organizer Dashboard use)
     */
    public RegistrationResponse(
            Long id,
            Long eventId,
            Long visitorId,
            String visitorName,
            String visitorEmail,
            String phone,
            RegistrationStatus status,
            LocalDateTime registeredAt,
            String notes) {
        this.id = id;
        this.eventId = eventId;
        this.visitorId = visitorId;
        this.visitorName = visitorName;
        this.visitorEmail = visitorEmail;
        this.phone = phone;
        this.status = status;
        this.registeredAt = registeredAt;
        this.notes = notes;
        this.hasTicket = false; // Default to false
    }

    /**
     * 🆕 COMPLETE constructor (includes hasTicket)
     */
    public RegistrationResponse(
            Long id,
            Long eventId,
            Long visitorId,
            String visitorName,
            String visitorEmail,
            String phone,
            RegistrationStatus status,
            LocalDateTime registeredAt,
            String notes,
            Boolean hasTicket) {
        this.id = id;
        this.eventId = eventId;
        this.visitorId = visitorId;
        this.visitorName = visitorName;
        this.visitorEmail = visitorEmail;
        this.phone = phone;
        this.status = status;
        this.registeredAt = registeredAt;
        this.notes = notes;
        this.hasTicket = hasTicket;
    }

    // ===============================
    // GETTERS & SETTERS
    // ===============================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Long getVisitorId() {
        return visitorId;
    }

    public void setVisitorId(Long visitorId) {
        this.visitorId = visitorId;
    }

    public String getVisitorName() {
        return visitorName;
    }

    public void setVisitorName(String visitorName) {
        this.visitorName = visitorName;
    }

    public String getVisitorEmail() {
        return visitorEmail;
    }

    public void setVisitorEmail(String visitorEmail) {
        this.visitorEmail = visitorEmail;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    // 🆕 NEW: hasTicket getter/setter
    public Boolean getHasTicket() {
        return hasTicket;
    }

    public void setHasTicket(Boolean hasTicket) {
        this.hasTicket = hasTicket;
    }

    // ===============================
    // toString
    // ===============================

    @Override
    public String toString() {
        return "RegistrationResponse{" +
                "id=" + id +
                ", eventId=" + eventId +
                ", visitorId=" + visitorId +
                ", visitorName='" + visitorName + '\'' +
                ", visitorEmail='" + visitorEmail + '\'' +
                ", phone='" + phone + '\'' +
                ", status=" + status +
                ", registeredAt=" + registeredAt +
                ", notes='" + notes + '\'' +
                ", hasTicket=" + hasTicket +
                '}';
    }
}

// ================================================================
// USAGE NOTES:
// - hasTicket: true if ticket exists for this registration
// - Frontend can check: if (registration.hasTicket) { show download button }
// - Backward compatible: Existing code will still work
// ================================================================