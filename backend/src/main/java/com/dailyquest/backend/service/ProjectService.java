package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.*;
import com.dailyquest.backend.dto.ProjectDto;
import com.dailyquest.backend.exception.DuplicateException;
import com.dailyquest.backend.exception.ErrorCode;
import com.dailyquest.backend.exception.ResourceNotFoundException;
import com.dailyquest.backend.exception.BusinessException;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final ProjectMemberRepository projectMemberRepository;
    private final ProjectActivityRepository projectActivityRepository;

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
        projectMemberRepository.save(ProjectMember.builder()
                .project(savedProject)
                .user(user)
                .role(ProjectRole.OWNER)
                .build());
        recordActivity(savedProject, user, ProjectActivityType.PROJECT_CREATED,
                user.getNickname() + " created the project");
        log.info("Project created: id={}, name={}", savedProject.getId(), savedProject.getName());

        return ProjectDto.Response.from(savedProject, 0, 0, ProjectRole.OWNER, 1);
    }

    public ProjectDto.Response getProject(Long userId, Long projectId) {
        Project project = getAccessibleProject(userId, projectId);

        long taskCount = taskRepository.countByProjectId(projectId);
        long completedCount = taskRepository.countByProjectIdAndIsCompleted(projectId, true);
        ProjectRole role = getRole(project, userId);
        long memberCount = getVisibleMemberCount(project);

        return ProjectDto.Response.from(project, taskCount, completedCount, role, memberCount);
    }

    public ProjectDto.StatsResponse getProjectStats(Long userId, Long projectId) {
        Project project = getAccessibleProject(userId, projectId);

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
        Map<Long, Project> projectMap = new java.util.LinkedHashMap<>();
        projectMemberRepository.findProjectsByUserId(userId)
                .forEach(project -> projectMap.put(project.getId(), project));
        projectRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .forEach(project -> projectMap.putIfAbsent(project.getId(), project));
        List<Project> projects = new java.util.ArrayList<>(projectMap.values());

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
                    return ProjectDto.Response.from(
                            project,
                            stats[0],
                            stats[1],
                            getRole(project, userId),
                            getVisibleMemberCount(project)
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProjectDto.Response updateProject(Long userId, Long projectId, ProjectDto.UpdateRequest request) {
        Project project = getProjectWithRole(userId, projectId, ProjectRole.OWNER, ProjectRole.ADMIN);

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

        User actor = getUser(userId);
        recordActivity(project, actor, ProjectActivityType.PROJECT_UPDATED,
                actor.getNickname() + " updated the project");
        log.info("Project updated: id={}", projectId);

        long taskCount = taskRepository.countByProjectId(projectId);
        long completedCount = taskRepository.countByProjectIdAndIsCompleted(projectId, true);

        return ProjectDto.Response.from(project, taskCount, completedCount, getRole(project, userId),
                getVisibleMemberCount(project));
    }

    @Transactional
    public void deleteProject(Long userId, Long projectId) {
        Project project = getProjectWithRole(userId, projectId, ProjectRole.OWNER);

        taskRepository.clearProjectReferencesByProjectId(projectId);
        projectRepository.delete(project);
        log.info("Project deleted: id={}", projectId);
    }

    @Transactional
    public ProjectDto.MemberResponse shareProject(Long userId, Long projectId, ProjectDto.ShareRequest request) {
        Project project = getProjectWithRole(userId, projectId, ProjectRole.OWNER, ProjectRole.ADMIN);
        validateAssignableRole(request.getRole());

        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, request.getEmail()));

        if (targetUser.getId().equals(project.getUser().getId())) {
            throw new DuplicateException(ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS, request.getEmail());
        }

        if (projectMemberRepository.existsByProjectIdAndUserId(projectId, targetUser.getId())) {
            throw new DuplicateException(ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS, request.getEmail());
        }

        ProjectMember member;
        try {
            member = projectMemberRepository.saveAndFlush(ProjectMember.builder()
                    .project(project)
                    .user(targetUser)
                    .role(request.getRole())
                    .build());
        } catch (DataIntegrityViolationException e) {
            throw new DuplicateException(ErrorCode.PROJECT_MEMBER_ALREADY_EXISTS, request.getEmail());
        }

        User actor = getUser(userId);
        recordActivity(project, actor, ProjectActivityType.PROJECT_SHARED,
                actor.getNickname() + " shared the project with " + targetUser.getNickname());
        return ProjectDto.MemberResponse.from(member);
    }

    public List<ProjectDto.MemberResponse> getProjectMembers(Long userId, Long projectId) {
        Project project = getAccessibleProject(userId, projectId);
        ProjectRole callerRole = getRole(project, userId);
        boolean hideEmail = callerRole == ProjectRole.VIEWER;

        List<ProjectDto.MemberResponse> members = projectMemberRepository.findByProjectIdOrderByCreatedAtAsc(projectId)
                .stream()
                .map(m -> hideEmail ? ProjectDto.MemberResponse.fromWithoutEmail(m) : ProjectDto.MemberResponse.from(m))
                .toList();

        if (members.stream().anyMatch(member -> member.getUserId().equals(project.getUser().getId()))) {
            return members;
        }

        ProjectDto.MemberResponse owner = ProjectDto.MemberResponse.builder()
                .id(null)
                .userId(project.getUser().getId())
                .email(hideEmail ? null : project.getUser().getEmail())
                .nickname(project.getUser().getNickname())
                .role(ProjectRole.OWNER)
                .createdAt(project.getCreatedAt())
                .build();
        return java.util.stream.Stream.concat(java.util.stream.Stream.of(owner), members.stream()).toList();
    }

    @Transactional
    public ProjectDto.MemberResponse updateMemberRole(
            Long userId,
            Long projectId,
            Long memberId,
            ProjectDto.UpdateMemberRoleRequest request
    ) {
        Project project = getProjectWithRole(userId, projectId, ProjectRole.OWNER, ProjectRole.ADMIN);
        validateAssignableRole(request.getRole());

        ProjectMember member = projectMemberRepository.findByIdAndProjectId(memberId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND, memberId));
        if (member.getRole() == ProjectRole.OWNER) {
            throw new BusinessException(ErrorCode.NO_PERMISSION);
        }

        member.updateRole(request.getRole());
        User actor = getUser(userId);
        recordActivity(project, actor, ProjectActivityType.MEMBER_ROLE_UPDATED,
                actor.getNickname() + " updated " + member.getUser().getNickname() + "'s role to " + request.getRole());
        return ProjectDto.MemberResponse.from(member);
    }

    @Transactional
    public void removeMember(Long userId, Long projectId, Long memberId) {
        Project project = getProjectWithRole(userId, projectId, ProjectRole.OWNER, ProjectRole.ADMIN);
        ProjectMember member = projectMemberRepository.findByIdAndProjectId(memberId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.NOT_FOUND, memberId));
        if (member.getRole() == ProjectRole.OWNER) {
            throw new BusinessException(ErrorCode.NO_PERMISSION);
        }

        projectMemberRepository.delete(member);
        User actor = getUser(userId);
        recordActivity(project, actor, ProjectActivityType.MEMBER_REMOVED,
                actor.getNickname() + " removed " + member.getUser().getNickname() + " from the project");
    }

    public List<ProjectDto.ActivityResponse> getProjectActivities(Long userId, Long projectId) {
        getAccessibleProject(userId, projectId);
        return projectActivityRepository.findTop20ByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(ProjectDto.ActivityResponse::from)
                .toList();
    }

    public Project getAccessibleProject(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND, projectId));

        if (project.getUser().getId().equals(userId)) {
            return project;
        }

        if (!projectMemberRepository.existsByProjectIdAndUserId(projectId, userId)) {
            throw new BusinessException(ErrorCode.NO_PERMISSION);
        }

        return project;
    }

    public Project getProjectWithRole(Long userId, Long projectId, ProjectRole... allowedRoles) {
        Project project = getAccessibleProject(userId, projectId);
        ProjectRole role = getRole(project, userId);
        for (ProjectRole allowedRole : allowedRoles) {
            if (role == allowedRole) {
                return project;
            }
        }
        throw new BusinessException(ErrorCode.NO_PERMISSION);
    }

    public ProjectRole getRole(Project project, Long userId) {
        if (project.getUser().getId().equals(userId)) {
            return ProjectRole.OWNER;
        }
        return projectMemberRepository.findByProjectIdAndUserId(project.getId(), userId)
                .map(ProjectMember::getRole)
                .orElseThrow(() -> new BusinessException(ErrorCode.NO_PERMISSION));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, userId));
    }

    private void validateAssignableRole(ProjectRole role) {
        if (role == ProjectRole.OWNER) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "OWNER role cannot be assigned");
        }
    }

    private long getVisibleMemberCount(Project project) {
        if (project.getUser() == null) {
            return projectMemberRepository.countByProjectId(project.getId());
        }
        long memberCount = projectMemberRepository.countByProjectId(project.getId());
        boolean ownerHasMembership = projectMemberRepository.existsByProjectIdAndUserId(
                project.getId(),
                project.getUser().getId()
        );
        return ownerHasMembership ? memberCount : memberCount + 1;
    }

    private void recordActivity(Project project, User actor, ProjectActivityType type, String message) {
        projectActivityRepository.save(ProjectActivity.builder()
                .project(project)
                .actor(actor)
                .type(type)
                .message(message)
                .build());
    }
}
