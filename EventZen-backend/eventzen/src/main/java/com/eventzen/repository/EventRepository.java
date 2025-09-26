// ================== EventRepository.java ==================
package com.eventzen.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventzen.entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    List<Event> findByOrganizerId(Long organizerId);

    List<Event> findByOrganizerIdAndDateGreaterThanEqualOrderByDateAsc(Long organizerId, LocalDate date);

    List<Event> findByOrganizerIdAndDateLessThanOrderByDateDesc(Long organizerId, LocalDate date);

    int countByOrganizerId(Long organizerId);
}
