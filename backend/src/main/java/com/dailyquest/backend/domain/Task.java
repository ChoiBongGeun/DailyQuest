package com.dailyquest.backend.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_tasks_user_id", columnList = "user_id"),
    @Index(name = "idx_tasks_due_date", columnList = "due_date"),
    @Index(name = "idx_tasks_is_completed", columnList = "is_completed"),
    @Index(name = "idx_tasks_user_due_date", columnList = "user_id, due_date")
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "due_time")
    private LocalTime dueTime;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "is_recurring")
    @Builder.Default
    private Boolean isRecurring = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type", length = 20)
    private RecurrenceType recurrenceType;

    @Column(name = "recurrence_interval")
    @Builder.Default
    private Integer recurrenceInterval = 1;

    @Column(name = "recurrence_end_date")
    private LocalDate recurrenceEndDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_task_id")
    private Task parentTask;

    @OneToMany(mappedBy = "parentTask", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Task> childTasks = new ArrayList<>();

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public void updateTitle(String title) {
        this.title = title;
    }

    public void updateDescription(String description) {
        this.description = description;
    }

    public void updatePriority(Priority priority) {
        this.priority = priority;
    }

    public void updateDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public void updateDueTime(LocalTime dueTime) {
        this.dueTime = dueTime;
    }

    public void complete() {
        this.isCompleted = true;
        this.completedAt = LocalDateTime.now();
    }

    public void uncomplete() {
        this.isCompleted = false;
        this.completedAt = null;
    }

    public void setRecurring(RecurrenceType type, Integer interval, LocalDate endDate) {
        this.isRecurring = true;
        this.recurrenceType = type;
        this.recurrenceInterval = interval;
        this.recurrenceEndDate = endDate;
    }

    public void clearRecurring() {
        this.isRecurring = false;
        this.recurrenceType = null;
        this.recurrenceInterval = 1;
        this.recurrenceEndDate = null;
    }

    public void changeProject(Project project) {
        this.project = project;
    }


    public boolean isRecurringTask() {
        return Boolean.TRUE.equals(this.isRecurring);
    }

    public boolean isTaskCompleted() {
        return Boolean.TRUE.equals(this.isCompleted);
    }
}
