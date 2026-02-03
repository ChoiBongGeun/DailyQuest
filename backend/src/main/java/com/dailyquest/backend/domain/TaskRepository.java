package com.dailyquest.backend.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    
    List<Task> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    List<Task> findByUserIdAndIsCompleted(Long userId, Boolean isCompleted);
    
    List<Task> findByUserIdAndDueDate(Long userId, LocalDate dueDate);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND t.dueDate BETWEEN :startDate AND :endDate " +
           "ORDER BY t.dueDate ASC, t.priority DESC")
    List<Task> findByUserIdAndDueDateBetween(
        @Param("userId") Long userId,
        @Param("startDate") LocalDate startDate,
        @Param("endDate") LocalDate endDate
    );
    
    List<Task> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<Task> findByProjectIdAndUserIdOrderByCreatedAtDesc(Long projectId, Long userId);
    
    List<Task> findByProjectIdAndIsCompleted(Long projectId, Boolean isCompleted);
    
    List<Task> findByUserIdAndPriorityOrderByDueDateAsc(Long userId, Priority priority);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND t.dueDate < :today AND t.isCompleted = false " +
           "ORDER BY t.dueDate ASC")
    List<Task> findOverdueTasks(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    @Query("SELECT t FROM Task t WHERE t.user.id = :userId " +
           "AND t.isRecurring = true AND t.parentTask IS NULL")
    List<Task> findRecurringParentTasks(@Param("userId") Long userId);
    
    List<Task> findByParentTaskId(Long parentTaskId);

    Optional<Task> findByIdAndUserId(Long id, Long userId);
    
    long countByUserId(Long userId);
    
    long countByUserIdAndIsCompleted(Long userId, Boolean isCompleted);
    
    long countByProjectId(Long projectId);

    long countByProjectIdAndIsCompleted(Long projectId, Boolean isCompleted);

    /**
     * 프로젝트별 태스크 수와 완료 태스크 수를 한 번의 쿼리로 조회 (N+1 방지)
     */
    @Query("SELECT t.project.id AS projectId, " +
           "COUNT(t) AS taskCount, " +
           "SUM(CASE WHEN t.isCompleted = true THEN 1 ELSE 0 END) AS completedCount " +
           "FROM Task t WHERE t.project.id IN :projectIds GROUP BY t.project.id")
    List<Object[]> countTasksByProjectIds(@Param("projectIds") List<Long> projectIds);
}
