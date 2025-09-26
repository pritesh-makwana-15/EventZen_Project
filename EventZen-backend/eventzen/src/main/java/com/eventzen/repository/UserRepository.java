// ================== UserRepository.java ==================
package com.eventzen.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.eventzen.entity.Role;
import com.eventzen.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRole(Role role);

    long countByRole(Role role);

    boolean existsByEmail(String email);
}
