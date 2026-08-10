package com.dailyquest.backend.controller;

import com.dailyquest.backend.dto.ApiResponse;
import com.dailyquest.backend.dto.ProjectDto;
import com.dailyquest.backend.service.ProjectService;
import com.dailyquest.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Project", description = "Project Management API")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "Create project", description = "Create a new project")
    @PostMapping
    public ResponseEntity<ApiResponse<ProjectDto.Response>> createProject(
            @Valid @RequestBody ProjectDto.CreateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ProjectDto.Response response = projectService.createProject(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", response));
    }

    @Operation(summary = "Get project", description = "Get project details by ID")
    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDto.Response>> getProject(
            @Parameter(description = "Project ID") @PathVariable Long projectId) {
        Long userId = SecurityUtil.getCurrentUserId();
        ProjectDto.Response response = projectService.getProject(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get all projects", description = "Get all projects for current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectDto.Response>>> getAllProjects() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<ProjectDto.Response> response = projectService.getAllProjects(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get project stats", description = "Get project task statistics")
    @GetMapping("/{projectId}/stats")
    public ResponseEntity<ApiResponse<ProjectDto.StatsResponse>> getProjectStats(
            @Parameter(description = "Project ID") @PathVariable Long projectId) {
        Long userId = SecurityUtil.getCurrentUserId();
        ProjectDto.StatsResponse response = projectService.getProjectStats(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get project members", description = "Get members in a project")
    @GetMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<List<ProjectDto.MemberResponse>>> getProjectMembers(
            @Parameter(description = "Project ID") @PathVariable Long projectId) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<ProjectDto.MemberResponse> response = projectService.getProjectMembers(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Share project", description = "Add an existing user to a project")
    @PostMapping("/{projectId}/members")
    public ResponseEntity<ApiResponse<ProjectDto.MemberResponse>> shareProject(
            @Parameter(description = "Project ID") @PathVariable Long projectId,
            @Valid @RequestBody ProjectDto.ShareRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ProjectDto.MemberResponse response = projectService.shareProject(userId, projectId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project shared successfully", response));
    }

    @Operation(summary = "Update project member role", description = "Change a member role in a project")
    @PatchMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponse<ProjectDto.MemberResponse>> updateMemberRole(
            @Parameter(description = "Project ID") @PathVariable Long projectId,
            @Parameter(description = "Member ID") @PathVariable Long memberId,
            @Valid @RequestBody ProjectDto.UpdateMemberRoleRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ProjectDto.MemberResponse response = projectService.updateMemberRole(userId, projectId, memberId, request);
        return ResponseEntity.ok(ApiResponse.success("Project member role updated", response));
    }

    @Operation(summary = "Remove project member", description = "Remove a member from a project")
    @DeleteMapping("/{projectId}/members/{memberId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @Parameter(description = "Project ID") @PathVariable Long projectId,
            @Parameter(description = "Member ID") @PathVariable Long memberId) {
        Long userId = SecurityUtil.getCurrentUserId();
        projectService.removeMember(userId, projectId, memberId);
        return ResponseEntity.ok(ApiResponse.success("Project member removed"));
    }

    @Operation(summary = "Get project activities", description = "Get recent project activity log")
    @GetMapping("/{projectId}/activities")
    public ResponseEntity<ApiResponse<List<ProjectDto.ActivityResponse>>> getProjectActivities(
            @Parameter(description = "Project ID") @PathVariable Long projectId) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<ProjectDto.ActivityResponse> response = projectService.getProjectActivities(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update project", description = "Update project information")
    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectDto.Response>> updateProject(
            @Parameter(description = "Project ID") @PathVariable Long projectId,
            @Valid @RequestBody ProjectDto.UpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        ProjectDto.Response response = projectService.updateProject(userId, projectId, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", response));
    }

    @Operation(summary = "Delete project", description = "Delete a project. Tasks in this project will have no project.")
    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(
            @Parameter(description = "Project ID") @PathVariable Long projectId) {
        Long userId = SecurityUtil.getCurrentUserId();
        projectService.deleteProject(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully"));
    }
}
