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

        // ===== Visitor Methods =====
        @Override
        public RegistrationResponse registerForEvent(RegistrationRequest request) throws Exception {
                User visitor = userRepository.findById(request.getVisitorId())
                                .orElseThrow(() -> new Exception("Visitor not found"));
                Event event = eventRepository.findById(request.getEventId())
                                .orElseThrow(() -> new Exception("Event not found"));

                Registration registration = new Registration();
                registration.setVisitor(visitor);
                registration.setEvent(event);
                registration.setStatus(RegistrationStatus.PENDING);
                registration.setRegisteredAt(LocalDateTime.now());

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
        }

        // ===== Admin Method =====
        @Override
        public List<RegistrationResponse> getAllRegistrations() {
                return registrationRepository.findAll()
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        // ===== Helper =====
        private RegistrationResponse mapToResponse(Registration registration) {
                return new RegistrationResponse(
                                registration.getId(),
                                registration.getEvent().getId(),
                                registration.getVisitor().getId(),
                                registration.getStatus(),
                                registration.getRegisteredAt());
        }
}
