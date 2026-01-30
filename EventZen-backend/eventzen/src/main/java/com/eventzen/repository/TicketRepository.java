// ================================================================
// FILE: TicketRepository.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/repository/
// Description: Repository for Ticket entity operations
// ================================================================

package com.eventzen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eventzen.entity.Registration;
import com.eventzen.entity.Ticket;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    /**
     * Find ticket by registration
     * Used to check if ticket already exists for a registration
     */
    Optional<Ticket> findByRegistration(Registration registration);

    /**
     * Find ticket by registration ID
     * More convenient than loading full registration entity
     */
    @Query("SELECT t FROM Ticket t WHERE t.registration.id = :registrationId")
    Optional<Ticket> findByRegistrationId(@Param("registrationId") Long registrationId);

    /**
     * Find ticket by unique ticket code
     * Used for QR code validation and check-in
     */
    Optional<Ticket> findByTicketCode(String ticketCode);

    /**
     * Find all tickets for a specific event
     * Used for event organizer analytics
     */
    @Query("SELECT t FROM Ticket t WHERE t.registration.event.id = :eventId")
    List<Ticket> findByEventId(@Param("eventId") Long eventId);

    /**
     * Find all tickets for a specific visitor
     * Used in "My Registrations" page
     */
    @Query("SELECT t FROM Ticket t WHERE t.registration.visitor.id = :visitorId")
    List<Ticket> findByVisitorId(@Param("visitorId") Long visitorId);

    /**
     * Check if ticket exists for a registration
     * Prevents duplicate ticket generation
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM Ticket t WHERE t.registration.id = :registrationId")
    boolean existsByRegistrationId(@Param("registrationId") Long registrationId);

    /**
     * Count checked-in tickets for an event
     * Used for event attendance tracking
     */
    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.registration.event.id = :eventId AND t.isCheckedIn = true")
    long countCheckedInByEventId(@Param("eventId") Long eventId);

    /**
     * Find all checked-in tickets for an event
     * Used for attendance reports
     */
    @Query("SELECT t FROM Ticket t WHERE t.registration.event.id = :eventId AND t.isCheckedIn = true")
    List<Ticket> findCheckedInTicketsByEventId(@Param("eventId") Long eventId);
}

// ================================================================
// USAGE NOTES:
// - findByRegistrationId(): Used when visitor downloads ticket
// - findByTicketCode(): Used for QR code scanning at event
// - findByVisitorId(): Used in "My Registrations" page
// - existsByRegistrationId(): Prevents duplicate ticket creation
// - Check-in methods: For future event check-in feature
// ================================================================