package com.dailyquest.backend.domain;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    
    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Project> findByUserId(Long userId);
    
    boolean existsByUserIdAndName(Long userId, String name);

    Optional<Project> findByIdAndUserId(Long id, Long userId);
}
