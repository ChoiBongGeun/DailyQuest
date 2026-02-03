package com.dailyquest.backend.dto;

import com.dailyquest.backend.domain.Priority;
import com.dailyquest.backend.domain.RecurrenceType;
import com.dailyquest.backend.domain.Task;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class TaskDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {

        @NotBlank(message = "Title is required")
        @Size(max = 255, message = "Title must be 255 characters or less")
        private String title;

        private String description;

        private Priority priority;

        private LocalDate dueDate;

        private LocalTime dueTime;

        // 개별 알림 설정 (분 단위). null이면 사용자 기본 설정 사용
        private List<Integer> reminderOffsets;

        private Long projectId;

        // Recurring task
        private Boolean isRecurring;
        private RecurrenceType recurrenceType;
        private Integer recurrenceInterval;
        private LocalDate recurrenceEndDate;

        @AssertTrue(message = "recurrenceType is required when isRecurring is true")
        public boolean isRecurringConfigurationValid() {
            return !Boolean.TRUE.equals(isRecurring) || recurrenceType != null;
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {

        @Size(max = 255, message = "Title must be 255 characters or less")
        private String title;

        private String description;

        private Priority priority;

        private LocalDate dueDate;

        private LocalTime dueTime;

        // 개별 알림 설정 (분 단위). null이면 변경 없음, 빈 배열이면 기본 설정 사용으로 초기화
        private List<Integer> reminderOffsets;

        private Long projectId;

        // Recurring task
        private Boolean isRecurring;
        private RecurrenceType recurrenceType;
        private Integer recurrenceInterval;
        private LocalDate recurrenceEndDate;

        @AssertTrue(message = "recurrenceType is required when isRecurring is true")
        public boolean isRecurringConfigurationValid() {
            return !Boolean.TRUE.equals(isRecurring) || recurrenceType != null;
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {

        private Long id;
        private String title;
        private String description;
        private Priority priority;
        private LocalDate dueDate;
        private LocalTime dueTime;
        private List<Integer> reminderOffsets; // null이면 사용자 기본 설정 사용
        private Boolean isCompleted;
        private LocalDateTime completedAt;

        // Recurring task
        private Boolean isRecurring;
        private RecurrenceType recurrenceType;
        private Integer recurrenceInterval;
        private LocalDate recurrenceEndDate;
        private Long parentTaskId;

        // Project info
        private Long projectId;
        private String projectName;
        private String projectColor;

        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public static Response from(Task task) {
            return Response.builder()
                    .id(task.getId())
                    .title(task.getTitle())
                    .description(task.getDescription())
                    .priority(task.getPriority())
                    .dueDate(task.getDueDate())
                    .dueTime(task.getDueTime())
                    .reminderOffsets(parseReminderOffsets(task.getReminderOffsets()))
                    .isCompleted(task.getIsCompleted())
                    .completedAt(task.getCompletedAt())
                    .isRecurring(task.getIsRecurring())
                    .recurrenceType(task.getRecurrenceType())
                    .recurrenceInterval(task.getRecurrenceInterval())
                    .recurrenceEndDate(task.getRecurrenceEndDate())
                    .parentTaskId(task.getParentTask() != null ? task.getParentTask().getId() : null)
                    .projectId(task.getProject() != null ? task.getProject().getId() : null)
                    .projectName(task.getProject() != null ? task.getProject().getName() : null)
                    .projectColor(task.getProject() != null ? task.getProject().getColor() : null)
                    .createdAt(task.getCreatedAt())
                    .updatedAt(task.getUpdatedAt())
                    .build();
        }

        private static List<Integer> parseReminderOffsets(String offsets) {
            if (offsets == null || offsets.isBlank()) {
                return null;
            }
            try {
                return java.util.Arrays.stream(offsets.split(","))
                        .map(String::trim)
                        .map(Integer::parseInt)
                        .toList();
            } catch (NumberFormatException e) {
                return null;
            }
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ListResponse {
        private Long id;
        private String title;
        private Priority priority;
        private LocalDate dueDate;
        private LocalTime dueTime;
        private List<Integer> reminderOffsets; // null이면 사용자 기본 설정 사용
        private Boolean isCompleted;
        private Boolean isRecurring;
        private Long projectId;
        private String projectName;
        private String projectColor;

        public static ListResponse from(Task task) {
            return ListResponse.builder()
                    .id(task.getId())
                    .title(task.getTitle())
                    .priority(task.getPriority())
                    .dueDate(task.getDueDate())
                    .dueTime(task.getDueTime())
                    .reminderOffsets(parseReminderOffsets(task.getReminderOffsets()))
                    .isCompleted(task.getIsCompleted())
                    .isRecurring(task.getIsRecurring())
                    .projectId(task.getProject() != null ? task.getProject().getId() : null)
                    .projectName(task.getProject() != null ? task.getProject().getName() : null)
                    .projectColor(task.getProject() != null ? task.getProject().getColor() : null)
                    .build();
        }

        private static List<Integer> parseReminderOffsets(String offsets) {
            if (offsets == null || offsets.isBlank()) {
                return null;
            }
            try {
                return java.util.Arrays.stream(offsets.split(","))
                        .map(String::trim)
                        .map(Integer::parseInt)
                        .toList();
            } catch (NumberFormatException e) {
                return null;
            }
        }
    }
}
