// ================== RegistrationRepository.java ==================
package com.eventzen.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventzen.entity.Event;
import com.eventzen.entity.Registration;
import com.eventzen.entity.User;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    List<Registration> findByVisitor(User visitor);

    List<Registration> findByEvent(Event event);

    boolean existsByVisitorAndEvent(User visitor, Event event);
}