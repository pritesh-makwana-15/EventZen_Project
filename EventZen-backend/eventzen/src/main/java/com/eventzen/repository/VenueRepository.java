// ================================================================
// FILE: VenueRepository.java
// Location: src/main/java/com/eventzen/repository/
// STATUS: ✅ FINAL MERGED (Old + New) – Stable & Backward Compatible
// ================================================================

package com.eventzen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.eventzen.entity.Venue;

/**
 * ✅ Venue Repository
 *
 * ✔ Preserves all legacy search methods
 * ✔ Adds organizer-friendly venue selection features
 * ✔ Safe for Admin + Organizer + Visitor usage
 */
@Repository
public interface VenueRepository extends JpaRepository<Venue, Long> {

    // ================================================================
    // 🔹 OLD / BASIC METHODS (DO NOT BREAK)
    // ================================================================

    List<Venue> findByIsActiveTrue();

    List<Venue> findByCity(String city);

    List<Venue> findByState(String state);

    List<Venue> findByNameContainingIgnoreCase(String name);

    Optional<Venue> findByName(String name);

    // ================================================================
    // 🆕 ORGANIZER / UI SUPPORT METHODS
    // ================================================================

    /**
     * ✔ Get all active venues ordered by name
     * Used for: Dropdowns (Create / Edit Event)
     */
    @Query("SELECT v FROM Venue v WHERE v.isActive = true ORDER BY v.name ASC")
    List<Venue> findByIsActiveTrueOrderByNameAsc();

    /**
     * ✔ Search active venues by name (autocomplete)
     * Used for: Organizer → Venue selection search
     */
    @Query("""
             SELECT v FROM Venue v
             WHERE v.isActive = true
             AND LOWER(v.name) LIKE LOWER(CONCAT('%', :query, '%'))
             ORDER BY v.name ASC
            """)
    List<Venue> searchByName(@Param("query") String query);
}
