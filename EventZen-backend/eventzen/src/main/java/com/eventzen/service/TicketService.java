// ================================================================
// FILE: TicketService.java
// Location: EventZen-backend/eventzen/src/main/java/com/eventzen/service/
// ================================================================

package com.eventzen.service;

import com.eventzen.entity.Registration;
import com.eventzen.entity.Ticket;

public interface TicketService {

    Ticket generateTicket(Registration registration) throws Exception;

    Ticket getTicketByRegistrationId(Long registrationId) throws Exception;

    Ticket getTicketById(Long ticketId) throws Exception;

    byte[] generateTicketPdf(Long ticketId) throws Exception;

    boolean hasTicket(Long registrationId);
}