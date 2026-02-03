package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.ProjectRepository;
import com.dailyquest.backend.domain.TaskRepository;
import com.dailyquest.backend.dto.DashboardDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dailyquest.backend.domain.Project;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;

    public DashboardDto.Response getDashboard(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        long totalTasks = taskRepository.countByUserId(userId);
        long completedTasks = taskRepository.countByUserIdAndIsCompleted(userId, true);
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = taskRepository.findOverdueTasks(userId, today).size();

        double completionRate = totalTasks > 0 
                ? Math.round((double) completedTasks / totalTasks * 100 * 10) / 10.0 
                : 0;

        var todayTaskList = taskRepository.findByUserIdAndDueDate(userId, today);
        long todayTasks = todayTaskList.size();
        long todayCompleted = todayTaskList.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsCompleted()))
                .count();

        var weekTaskList = taskRepository.findByUserIdAndDueDateBetween(userId, startOfWeek, endOfWeek);
        long weekTasks = weekTaskList.size();
        long weekCompleted = weekTaskList.stream()
                .filter(t -> Boolean.TRUE.equals(t.getIsCompleted()))
                .count();

        // N+1 방지: 한 번의 쿼리로 모든 프로젝트의 태스크 통계 조회
        List<Project> projects = projectRepository.findByUserId(userId);
        Map<Long, long[]> statsMap = new HashMap<>();
        if (!projects.isEmpty()) {
            List<Long> projectIds = projects.stream().map(Project::getId).collect(Collectors.toList());
            taskRepository.countTasksByProjectIds(projectIds).forEach(row -> {
                Long projectId = (Long) row[0];
                long tc = (Long) row[1];
                long cc = (Long) row[2];
                statsMap.put(projectId, new long[]{tc, cc});
            });
        }

        List<DashboardDto.ProjectStats> projectStats = projects.stream()
                .map(project -> {
                    long[] stats = statsMap.getOrDefault(project.getId(), new long[]{0, 0});
                    long taskCount = stats[0];
                    long completedCount = stats[1];
                    double rate = taskCount > 0
                            ? Math.round((double) completedCount / taskCount * 100 * 10) / 10.0
                            : 0;

                    return DashboardDto.ProjectStats.builder()
                            .projectId(project.getId())
                            .projectName(project.getName())
                            .projectColor(project.getColor())
                            .taskCount(taskCount)
                            .completedCount(completedCount)
                            .completionRate(rate)
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardDto.Response.builder()
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .overdueTasks(overdueTasks)
                .completionRate(completionRate)
                .todayTasks(todayTasks)
                .todayCompleted(todayCompleted)
                .weekTasks(weekTasks)
                .weekCompleted(weekCompleted)
                .projectStats(projectStats)
                .build();
    }
}
