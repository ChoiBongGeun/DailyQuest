package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.*;
import com.dailyquest.backend.dto.TaskDto;
import com.dailyquest.backend.exception.ErrorCode;
import com.dailyquest.backend.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public TaskDto.Response createTask(Long userId, TaskDto.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, userId));

        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND, request.getProjectId()));
        }

        Task task = Task.builder()
                .user(user)
                .project(project)
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority() != null ? request.getPriority() : Priority.MEDIUM)
                .dueDate(request.getDueDate())
                .isRecurring(request.getIsRecurring() != null ? request.getIsRecurring() : false)
                .recurrenceType(request.getRecurrenceType())
                .recurrenceInterval(request.getRecurrenceInterval() != null ? request.getRecurrenceInterval() : 1)
                .recurrenceEndDate(request.getRecurrenceEndDate())
                .build();

        Task savedTask = taskRepository.save(task);
        log.info("Task created: id={}, title={}", savedTask.getId(), savedTask.getTitle());

        return TaskDto.Response.from(savedTask);
    }

    public TaskDto.Response getTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.TASK_NOT_FOUND, taskId));
        return TaskDto.Response.from(task);
    }

    public List<TaskDto.ListResponse> getAllTasks(Long userId) {
        return taskRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(TaskDto.ListResponse::from)
                .collect(Collectors.toList());
    }

    public List<TaskDto.ListResponse> getPendingTasks(Long userId) {
        return taskRepository.findByUserIdAndIsCompleted(userId, false)
                .stream()
                .map(TaskDto.ListResponse::from)
                .collect(Collectors.toList());
    }

    public List<TaskDto.ListResponse> getCompletedTasks(Long userId) {
        return taskRepository.findByUserIdAndIsCompleted(userId, true)
                .stream()
                .map(TaskDto.ListResponse::from)
                .collect(Collectors.toList());
    }

    public List<TaskDto.ListResponse> getTodayTasks(Long userId) {
        LocalDate today = LocalDate.now();
        return taskRepository.findByUserIdAndDueDate(userId, today)
                .stream()
                .map(TaskDto.ListResponse::from)
                .collect(Collectors.toList());
    }

    public List<TaskDto.ListResponse> getWeekTasks(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        return taskRepository.findByUserIdAndDueDateBetween(userId, startOfWeek, endOfWeek)
                .stream()
                .map(TaskDto.ListResponse::from)
                .collect(Collectors.toList());
    }

    public List<TaskDto.ListResponse> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectIdOrderByCreatedAtDesc(projectId)
                .stream()
                .map(TaskDto.ListResponse::from)
                .collect(Collectors.toList());
    }

    public List<TaskDto.ListResponse> getOverdueTasks(Long userId) {
        LocalDate today = LocalDate.now();
        return taskRepository.findOverdueTasks(userId, today)
                .stream()
                .map(TaskDto.ListResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public TaskDto.Response updateTask(Long taskId, TaskDto.UpdateRequest request) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.TASK_NOT_FOUND, taskId));

        if (request.getTitle() != null) {
            task.updateTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            task.updateDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            task.updatePriority(request.getPriority());
        }
        if (request.getDueDate() != null) {
            task.updateDueDate(request.getDueDate());
        }
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROJECT_NOT_FOUND, request.getProjectId()));
            task.setProject(project);
        }

        if (Boolean.TRUE.equals(request.getIsRecurring())) {
            task.setRecurring(
                    request.getRecurrenceType(),
                    request.getRecurrenceInterval() != null ? request.getRecurrenceInterval() : 1,
                    request.getRecurrenceEndDate()
            );
        } else if (Boolean.FALSE.equals(request.getIsRecurring())) {
            task.clearRecurring();
        }

        log.info("Task updated: id={}", taskId);
        return TaskDto.Response.from(task);
    }

    @Transactional
    public TaskDto.Response completeTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.TASK_NOT_FOUND, taskId));

        task.complete();
        log.info("Task completed: id={}", taskId);

        if (task.isRecurringTask()) {
            createNextRecurringTask(task);
        }

        return TaskDto.Response.from(task);
    }

    @Transactional
    public TaskDto.Response uncompleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.TASK_NOT_FOUND, taskId));

        task.uncomplete();
        log.info("Task uncompleted: id={}", taskId);
        return TaskDto.Response.from(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.TASK_NOT_FOUND, taskId));

        taskRepository.delete(task);
        log.info("Task deleted: id={}", taskId);
    }

    private void createNextRecurringTask(Task completedTask) {
        if (completedTask.getDueDate() == null) {
            return;
        }

        LocalDate nextDueDate = calculateNextDueDate(completedTask);

        if (completedTask.getRecurrenceEndDate() != null 
                && nextDueDate.isAfter(completedTask.getRecurrenceEndDate())) {
            log.info("Recurring task ended: parentId={}", completedTask.getId());
            return;
        }

        Task nextTask = Task.builder()
                .user(completedTask.getUser())
                .project(completedTask.getProject())
                .title(completedTask.getTitle())
                .description(completedTask.getDescription())
                .priority(completedTask.getPriority())
                .dueDate(nextDueDate)
                .isRecurring(true)
                .recurrenceType(completedTask.getRecurrenceType())
                .recurrenceInterval(completedTask.getRecurrenceInterval())
                .recurrenceEndDate(completedTask.getRecurrenceEndDate())
                .parentTask(completedTask.getParentTask() != null ? completedTask.getParentTask() : completedTask)
                .build();

        taskRepository.save(nextTask);
        log.info("Next recurring task created: parentId={}, nextDueDate={}", 
                completedTask.getId(), nextDueDate);
    }

    private LocalDate calculateNextDueDate(Task task) {
        LocalDate currentDue = task.getDueDate();
        int interval = task.getRecurrenceInterval();

        return switch (task.getRecurrenceType()) {
            case DAILY -> currentDue.plusDays(interval);
            case WEEKLY -> currentDue.plusWeeks(interval);
            case MONTHLY -> currentDue.plusMonths(interval);
        };
    }
}
