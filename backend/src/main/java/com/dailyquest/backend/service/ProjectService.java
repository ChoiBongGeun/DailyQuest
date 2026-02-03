package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.*;
import com.dailyquest.backend.dto.ProjectDto;
import com.dailyquest.backend.exception.DuplicateException;
import com.dailyquest.backend.exception.ErrorCode;
import com.dailyquest.backend.exception.ResourceNotFoundException;
import com.dailyquest.backend.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    @Transactional
    public ProjectDto.Response createProject(Long userId, ProjectDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, userId));

        if (projectRepository.existsByUserIdAndName(userId, request.getName())) {
            throw new DuplicateException(ErrorCode.PROJECT_NAME_ALREADY_EXISTS, request.getName());
        }

        Project project = Project.builder()
                .user(user)
                .name(request.getName())
                .color(request.getColor() != null ? request.getColor() : "#3B82F6")
                .build();

        Project savedProject = projectRepository.save(project);
        log.info("Project created: id={}, name={}", savedProject.getId(), savedProject.getName());

        return ProjectDto.Response.from(savedProject);
    }

    public ProjectDto.Response getProject(Long userId, Long projectId) {
        Project project = getOwnedProject(userId, projectId);

        long taskCount = taskRepository.countByProjectId(projectId);
        long completedCount = taskRepository.countByProjectIdAndIsCompleted(projectId, true);

        return ProjectDto.Response.from(project, taskCount, completedCount);
    }

    public ProjectDto.StatsResponse getProjectStats(Long userId, Long projectId) {
        Project project = getOwnedProject(userId, projectId);

        long taskCount = taskRepository.countByProjectId(project.getId());
        long completedCount = taskRepository.countByProjectIdAndIsCompleted(project.getId(), true);
        double completionRate = taskCount > 0
                ? Math.round((double) completedCount / taskCount * 100 * 10) / 10.0
                : 0.0;

        return ProjectDto.StatsResponse.builder()
                .totalTasks(taskCount)
                .completedTasks(completedCount)
                .completionRate(completionRate)
                .build();
    }

    public List<ProjectDto.Response> getAllProjects(Long userId) {
        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (projects.isEmpty()) {
            return List.of();
        }

        // N+1 방지: 한 번의 쿼리로 모든 프로젝트의 태스크 통계 조회
        List<Long> projectIds = projects.stream().map(Project::getId).collect(Collectors.toList());
        Map<Long, long[]> statsMap = new HashMap<>();
        taskRepository.countTasksByProjectIds(projectIds).forEach(row -> {
            Long projectId = (Long) row[0];
            long taskCount = (Long) row[1];
            long completedCount = (Long) row[2];
            statsMap.put(projectId, new long[]{taskCount, completedCount});
        });

        return projects.stream()
                .map(project -> {
                    long[] stats = statsMap.getOrDefault(project.getId(), new long[]{0, 0});
                    return ProjectDto.Response.from(project, stats[0], stats[1]);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto.Response updateProject(Long userId, Long projectId, ProjectDto.UpdateRequest request) {
        Project project = getOwnedProject(userId, projectId);

        if (request.getName() != null) {
            if (projectRepository.existsByUserIdAndName(project.getUser().getId(), request.getName())
                    && !project.getName().equals(request.getName())) {
                throw new DuplicateException(ErrorCode.PROJECT_NAME_ALREADY_EXISTS, request.getName());
            }
            project.updateName(request.getName());
        }

        if (request.getColor() != null) {
            project.updateColor(request.getColor());
        }

        log.info("Project updated: id={}", projectId);

        long taskCount = taskRepository.countByProjectId(projectId);
        long completedCount = taskRepository.countByProjectIdAndIsCompleted(projectId, true);

        return ProjectDto.Response.from(project, taskCount, completedCount);
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId) {
        Project project = getOwnedProject(userId, projectId);

        // 프로젝트에 속한 태스크의 프로젝트 참조를 null로 설정 (태스크 보존)
        taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .forEach(task -> task.changeProject(null));

        projectRepository.delete(project);
        log.info("Project deleted: id={}", projectId);
    }

    private Project getOwnedProject(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND, projectId));

        if (!project.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.NO_PERMISSION);
        }

        return project;
    }
}
