package com.dailyquest.backend.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {

    Optional<ProjectMember> findByProjectIdAndUserId(Long projectId, Long userId);

    Optional<ProjectMember> findByIdAndProjectId(Long id, Long projectId);

    List<ProjectMember> findByProjectIdOrderByCreatedAtAsc(Long projectId);

    boolean existsByProjectIdAndUserId(Long projectId, Long userId);

    long countByProjectId(Long projectId);

    @Query("SELECT pm.project FROM ProjectMember pm WHERE pm.user.id = :userId ORDER BY pm.project.createdAt DESC")
    List<Project> findProjectsByUserId(@Param("userId") Long userId);

    @Query("SELECT pm FROM ProjectMember pm JOIN FETCH pm.user WHERE pm.project.id IN :projectIds")
    List<ProjectMember> findAllByProjectIdIn(@Param("projectIds") List<Long> projectIds);
}
