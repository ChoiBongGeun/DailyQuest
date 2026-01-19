package com.dailyquest.backend.domain;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class TaskRepositoryTest {

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private User testUser;
    private Project testProject;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("test@test.com")
                .password("password123")
                .nickname("tester")
                .build());

        testProject = projectRepository.save(Project.builder()
                .user(testUser)
                .name("Test Project")
                .color("#3B82F6")
                .build());
    }

    @Test
    @DisplayName("Save task successfully")
    void saveTask() {
        // given
        Task task = Task.builder()
                .user(testUser)
                .project(testProject)
                .title("Test Task")
                .description("Test Description")
                .priority(Priority.HIGH)
                .dueDate(LocalDate.now().plusDays(1))
                .build();

        // when
        Task savedTask = taskRepository.save(task);

        // then
        assertThat(savedTask.getId()).isNotNull();
        assertThat(savedTask.getTitle()).isEqualTo("Test Task");
        assertThat(savedTask.getPriority()).isEqualTo(Priority.HIGH);
    }

    @Test
    @DisplayName("Find tasks by user ID")
    void findByUserId() {
        // given
        taskRepository.save(Task.builder()
                .user(testUser)
                .title("Task 1")
                .build());
        taskRepository.save(Task.builder()
                .user(testUser)
                .title("Task 2")
                .build());

        // when
        List<Task> tasks = taskRepository.findByUserIdOrderByCreatedAtDesc(testUser.getId());

        // then
        assertThat(tasks).hasSize(2);
    }

    @Test
    @DisplayName("Find tasks by due date")
    void findByDueDate() {
        // given
        LocalDate today = LocalDate.now();
        taskRepository.save(Task.builder()
                .user(testUser)
                .title("Today Task")
                .dueDate(today)
                .build());
        taskRepository.save(Task.builder()
                .user(testUser)
                .title("Tomorrow Task")
                .dueDate(today.plusDays(1))
                .build());

        // when
        List<Task> todayTasks = taskRepository.findByUserIdAndDueDate(testUser.getId(), today);

        // then
        assertThat(todayTasks).hasSize(1);
        assertThat(todayTasks.get(0).getTitle()).isEqualTo("Today Task");
    }

    @Test
    @DisplayName("Find overdue tasks")
    void findOverdueTasks() {
        // given
        LocalDate today = LocalDate.now();
        taskRepository.save(Task.builder()
                .user(testUser)
                .title("Overdue Task")
                .dueDate(today.minusDays(1))
                .isCompleted(false)
                .build());
        taskRepository.save(Task.builder()
                .user(testUser)
                .title("Completed Overdue Task")
                .dueDate(today.minusDays(1))
                .isCompleted(true)
                .build());

        // when
        List<Task> overdueTasks = taskRepository.findOverdueTasks(testUser.getId(), today);

        // then
        assertThat(overdueTasks).hasSize(1);
        assertThat(overdueTasks.get(0).getTitle()).isEqualTo("Overdue Task");
    }

    @Test
    @DisplayName("Count tasks by user")
    void countByUserId() {
        // given
        taskRepository.save(Task.builder().user(testUser).title("Task 1").isCompleted(false).build());
        taskRepository.save(Task.builder().user(testUser).title("Task 2").isCompleted(true).build());
        taskRepository.save(Task.builder().user(testUser).title("Task 3").isCompleted(true).build());

        // when
        long total = taskRepository.countByUserId(testUser.getId());
        long completed = taskRepository.countByUserIdAndIsCompleted(testUser.getId(), true);

        // then
        assertThat(total).isEqualTo(3);
        assertThat(completed).isEqualTo(2);
    }
}
