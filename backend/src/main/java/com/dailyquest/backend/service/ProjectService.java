package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.*;
import com.dailyquest.backend.dto.ProjectDto;
import com.dailyquest.backend.exception.DuplicateException;
import com.dailyquest.backend.exception.ErrorCode;
import com.dailyquest.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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

    public ProjectDto.Response getProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND, projectId));

        long taskCount = taskRepository.countByProjectId(projectId);
        long completedCount = taskRepository.countByProjectIdAndIsCompleted(projectId, true);

        return ProjectDto.Response.from(project, taskCount, completedCount);
    }

    public List<ProjectDto.Response> getAllProjects(Long userId) {
        return projectRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(project -> {
                    long taskCount = taskRepository.countByProjectId(project.getId());
                    long completedCount = taskRepository.countByProjectIdAndIsCompleted(project.getId(), true);
                    return ProjectDto.Response.from(project, taskCount, completedCount);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto.Response updateProject(Long projectId, ProjectDto.UpdateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND, projectId));

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
    public void deleteProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND, projectId));

        projectRepository.delete(project);
        log.info("Project deleted: id={}", projectId);
    }
}
