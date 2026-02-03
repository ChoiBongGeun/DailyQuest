package com.dailyquest.backend.controller;

import com.dailyquest.backend.dto.ApiResponse;
import com.dailyquest.backend.dto.TaskDto;
import com.dailyquest.backend.domain.Priority;
import com.dailyquest.backend.service.TaskService;
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

@Tag(name = "Task", description = "Task Management API")
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Create task", description = "Create a new task")
    @PostMapping
    public ResponseEntity<ApiResponse<TaskDto.Response>> createTask(
            @Valid @RequestBody TaskDto.CreateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        TaskDto.Response response = taskService.createTask(userId, request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Task created successfully", response));
    }

    @Operation(summary = "Get task", description = "Get task details by ID")
    @GetMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDto.Response>> getTask(
            @Parameter(description = "Task ID") @PathVariable Long taskId) {
        Long userId = SecurityUtil.getCurrentUserId();
        TaskDto.Response response = taskService.getTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get all tasks", description = "Get all tasks for current user")
    @GetMapping
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getAllTasks() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getAllTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get pending tasks", description = "Get incomplete tasks")
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getPendingTasks() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getPendingTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get completed tasks", description = "Get completed tasks")
    @GetMapping("/completed")
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getCompletedTasks() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getCompletedTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get today's tasks", description = "Get tasks due today")
    @GetMapping("/today")
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getTodayTasks() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getTodayTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get this week's tasks", description = "Get tasks due this week")
    @GetMapping("/week")
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getWeekTasks() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getWeekTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get tasks by project", description = "Get all tasks in a project")
    @GetMapping("/project/{projectId}")
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getTasksByProject(
            @Parameter(description = "Project ID") @PathVariable Long projectId) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getTasksByProject(userId, projectId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get tasks by priority", description = "Get tasks by priority for current user")
    @GetMapping("/priority/{priority}")
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getTasksByPriority(
            @Parameter(description = "Priority") @PathVariable Priority priority) {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getTasksByPriority(userId, priority);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get overdue tasks", description = "Get tasks past due date")
    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<TaskDto.ListResponse>>> getOverdueTasks() {
        Long userId = SecurityUtil.getCurrentUserId();
        List<TaskDto.ListResponse> response = taskService.getOverdueTasks(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update task", description = "Update task information")
    @PutMapping("/{taskId}")
    public ResponseEntity<ApiResponse<TaskDto.Response>> updateTask(
            @Parameter(description = "Task ID") @PathVariable Long taskId,
            @Valid @RequestBody TaskDto.UpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        TaskDto.Response response = taskService.updateTask(userId, taskId, request);
        return ResponseEntity.ok(ApiResponse.success("Task updated successfully", response));
    }

    @Operation(summary = "Complete task", description = "Mark task as completed. Creates next task if recurring.")
    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<ApiResponse<TaskDto.Response>> completeTask(
            @Parameter(description = "Task ID") @PathVariable Long taskId) {
        Long userId = SecurityUtil.getCurrentUserId();
        TaskDto.Response response = taskService.completeTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task completed", response));
    }

    @Operation(summary = "Uncomplete task", description = "Mark task as incomplete")
    @PatchMapping("/{taskId}/uncomplete")
    public ResponseEntity<ApiResponse<TaskDto.Response>> uncompleteTask(
            @Parameter(description = "Task ID") @PathVariable Long taskId) {
        Long userId = SecurityUtil.getCurrentUserId();
        TaskDto.Response response = taskService.uncompleteTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task marked as incomplete", response));
    }

    @Operation(summary = "Delete task", description = "Delete a task")
    @DeleteMapping("/{taskId}")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @Parameter(description = "Task ID") @PathVariable Long taskId) {
        Long userId = SecurityUtil.getCurrentUserId();
        taskService.deleteTask(userId, taskId);
        return ResponseEntity.ok(ApiResponse.success("Task deleted successfully"));
    }
}
