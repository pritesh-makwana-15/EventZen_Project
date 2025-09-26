// RegistrationServiceImpl.java (REPLACE)
package com.eventzen.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.eventzen.dto.request.RegistrationRequest;
import com.eventzen.dto.response.RegistrationResponse;
import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.RegistrationStatus;
import com.eventzen.entity.User;
import com.eventzen.repository.EventRepository;
import com.eventzen.repository.RegistrationRepository;
import com.eventzen.repository.UserRepository;
import com.eventzen.service.RegistrationService;

@Service
public class RegistrationServiceImpl implements RegistrationService {

        @Autowired
        private RegistrationRepository registrationRepository;

        @Autowired
        private UserRepository userRepository;

        @Autowired
        private EventRepository eventRepository;

        @Override
        public RegistrationResponse registerForEvent(RegistrationRequest request) throws Exception {
                User visitor = userRepository.findById(request.getVisitorId())
                                .orElseThrow(() -> new Exception("Visitor not found"));
                Event event = eventRepository.findById(request.getEventId())
                                .orElseThrow(() -> new Exception("Event not found"));

                if (registrationRepository.existsByVisitorAndEvent(visitor, event)) {
                        throw new Exception("User is already registered for this event");
                }

                if (event.getMaxAttendees() != null &&
                                event.getCurrentAttendees() != null &&
                                event.getCurrentAttendees() >= event.getMaxAttendees()) {
                        throw new Exception("Event has reached maximum capacity");
                }

                Registration registration = new Registration();
                registration.setVisitor(visitor);
                registration.setEvent(event);
                registration.setStatus(RegistrationStatus.CONFIRMED);
                registration.setRegisteredAt(LocalDateTime.now());

                if (event.getCurrentAttendees() == null) {
                        event.setCurrentAttendees(1);
                } else {
                        event.setCurrentAttendees(event.getCurrentAttendees() + 1);
                }
                eventRepository.save(event);

                Registration saved = registrationRepository.save(registration);
                return mapToResponse(saved);
        }

        @Override
        public List<RegistrationResponse> getRegistrationsByVisitor(Long visitorId) throws Exception {
                User visitor = userRepository.findById(visitorId)
                                .orElseThrow(() -> new Exception("Visitor not found"));
                return registrationRepository.findByVisitor(visitor)
                                .stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        @Override
        public List<RegistrationResponse> getRegistrationsByEvent(Long eventId) throws Exception {
                Event event = eventRepository.findById(eventId)
                                .orElseThrow(() -> new Exception("Event not found"));
                return registrationRepository.findByEvent(event)
                                .stream().map(this::mapToResponse).collect(Collectors.toList());
        }

        @Override
        public void cancelRegistration(Long registrationId) throws Exception {
                Registration registration = registrationRepository.findById(registrationId)
                                .orElseThrow(() -> new Exception("Registration not found"));

                registration.setStatus(RegistrationStatus.CANCELLED);
                registrationRepository.save(registration);

                Event event = registration.getEvent();
                if (event.getCurrentAttendees() != null && event.getCurrentAttendees() > 0) {
                        event.setCurrentAttendees(event.getCurrentAttendees() - 1);
                        eventRepository.save(event);
                }
        }

        @Override
        public List<RegistrationResponse> getAllRegistrations() {
                return registrationRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        private RegistrationResponse mapToResponse(Registration registration) {
                RegistrationResponse response = new RegistrationResponse();
                response.setId(registration.getId());
                response.setEventId(registration.getEvent().getId());
                response.setEventTitle(registration.getEvent().getTitle());
                response.setVisitorId(registration.getVisitor().getId());
                response.setVisitorName(registration.getVisitor().getName());
                response.setStatus(registration.getStatus());
                response.setRegisteredAt(registration.getRegisteredAt());
                return response;
        }
}