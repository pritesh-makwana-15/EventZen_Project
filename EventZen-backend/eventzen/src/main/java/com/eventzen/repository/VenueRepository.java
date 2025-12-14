// ================================================================
// FILE 1: VenueRepository.java
// ================================================================
package com.eventzen.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.eventzen.entity.Venue;

@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {
    List<Venue> findByIsActiveTrue();
    List<Venue> findByCity(String city);
    List<Venue> findByState(String state);
    List<Venue> findByNameContainingIgnoreCase(String name);
}