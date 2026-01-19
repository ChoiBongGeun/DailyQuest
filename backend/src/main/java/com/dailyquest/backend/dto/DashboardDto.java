package com.dailyquest.backend.dto;

import lombok.*;

import java.util.List;

public class DashboardDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        
        private long totalTasks;
        private long completedTasks;
        private long pendingTasks;
        private long overdueTasks;
        private double completionRate;
        
        private long todayTasks;
        private long todayCompleted;
        
        private long weekTasks;
        private long weekCompleted;
        
        private List<ProjectStats> projectStats;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProjectStats {
        
        private Long projectId;
        private String projectName;
        private String projectColor;
        private long taskCount;
        private long completedCount;
        private double completionRate;
    }
}
