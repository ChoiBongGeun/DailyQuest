package com.dailyquest.backend.dto;

import com.dailyquest.backend.domain.Project;
import com.dailyquest.backend.domain.ProjectActivity;
import com.dailyquest.backend.domain.ProjectActivityType;
import com.dailyquest.backend.domain.ProjectMember;
import com.dailyquest.backend.domain.ProjectRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
        private ProjectRole currentUserRole;
        private long memberCount;

        public static Response from(Project project) {
            return Response.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .color(project.getColor())
                    .createdAt(project.getCreatedAt())
                    .taskCount(0)
                    .completedTaskCount(0)
                    .currentUserRole(null)
                    .memberCount(0)
                    .build();
        }

        public static Response from(Project project, long taskCount, long completedTaskCount) {
            return from(project, taskCount, completedTaskCount, null, 0);
        }

        public static Response from(
                Project project,
                long taskCount,
                long completedTaskCount,
                ProjectRole currentUserRole,
                long memberCount
        ) {
            return Response.builder()
                    .id(project.getId())
                    .name(project.getName())
                    .color(project.getColor())
                    .createdAt(project.getCreatedAt())
                    .taskCount(taskCount)
                    .completedTaskCount(completedTaskCount)
                    .currentUserRole(currentUserRole)
                    .memberCount(memberCount)
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

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShareRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotNull(message = "Role is required")
        private ProjectRole role;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateMemberRoleRequest {
        @NotNull(message = "Role is required")
        private ProjectRole role;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberResponse {
        private Long id;
        private Long userId;
        private String email;
        private String nickname;
        private ProjectRole role;
        private LocalDateTime createdAt;

        public static MemberResponse from(ProjectMember member) {
            return MemberResponse.builder()
                    .id(member.getId())
                    .userId(member.getUser().getId())
                    .email(member.getUser().getEmail())
                    .nickname(member.getUser().getNickname())
                    .role(member.getRole())
                    .createdAt(member.getCreatedAt())
                    .build();
        }

        public static MemberResponse fromWithoutEmail(ProjectMember member) {
            return MemberResponse.builder()
                    .id(member.getId())
                    .userId(member.getUser().getId())
                    .email(null)
                    .nickname(member.getUser().getNickname())
                    .role(member.getRole())
                    .createdAt(member.getCreatedAt())
                    .build();
        }
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivityResponse {
        private Long id;
        private Long actorId;
        private String actorNickname;
        private ProjectActivityType type;
        private String message;
        private LocalDateTime createdAt;

        public static ActivityResponse from(ProjectActivity activity) {
            return ActivityResponse.builder()
                    .id(activity.getId())
                    .actorId(activity.getActor().getId())
                    .actorNickname(activity.getActor().getNickname())
                    .type(activity.getType())
                    .message(activity.getMessage())
                    .createdAt(activity.getCreatedAt())
                    .build();
        }
    }
}
