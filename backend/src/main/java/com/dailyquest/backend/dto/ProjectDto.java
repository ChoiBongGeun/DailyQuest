package com.dailyquest.backend.dto;

import com.dailyquest.backend.domain.Project;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

public class ProjectDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateRequest {
        
        @NotBlank(message = "Project name is required")
        @Size(max = 100, message = "Project name must be 100 characters or less")
        private String name;
        
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid color code format (e.g., #3B82F6)")
        private String color;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateRequest {
        
        @Size(max = 100, message = "Project name must be 100 characters or less")
        private String name;
        
        @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Invalid color code format (e.g., #3B82F6)")
        private String color;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        
        private Long id;
        private String name;
        private String color;
        private LocalDateTime createdAt;
        private long taskCount;
        private long completedTaskCount;

        public static Response from(Project project) {
            return Response.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .color(project.getColor())
                    .createdAt(project.getCreatedAt())
                    .taskCount(0)
                    .completedTaskCount(0)
                    .build();
        }

        public static Response from(Project project, long taskCount, long completedTaskCount) {
            return Response.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .color(project.getColor())
                    .createdAt(project.getCreatedAt())
                    .taskCount(taskCount)
                    .completedTaskCount(completedTaskCount)
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatsResponse {
        private long totalTasks;
        private long completedTasks;
        private double completionRate;
    }
}
