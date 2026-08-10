package com.dailyquest.backend.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectActivityRepository extends JpaRepository<ProjectActivity, Long> {

    @Query("SELECT pa FROM ProjectActivity pa JOIN FETCH pa.actor WHERE pa.project.id = :projectId ORDER BY pa.createdAt DESC LIMIT 20")
    List<ProjectActivity> findTop20ByProjectIdOrderByCreatedAtDesc(@Param("projectId") Long projectId);
}
