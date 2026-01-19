package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.*;
import com.dailyquest.backend.dto.TaskDto;
import com.dailyquest.backend.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @InjectMocks
    private TaskService taskService;

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProjectRepository projectRepository;

    private User testUser;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("password")
                .nickname("tester")
                .build();

        testTask = Task.builder()
                .id(1L)
                .user(testUser)
                .title("Test Task")
                .description("Test Description")
                .priority(Priority.MEDIUM)
                .dueDate(LocalDate.now().plusDays(1))
                .isCompleted(false)
                .isRecurring(false)
                .build();
    }

    @Test
    @DisplayName("Create task successfully")
    void createTask() {
        // given
        TaskDto.CreateRequest request = TaskDto.CreateRequest.builder()
                .title("New Task")
                .description("Description")
                .priority(Priority.HIGH)
                .dueDate(LocalDate.now().plusDays(1))
                .build();

        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));
        given(taskRepository.save(any(Task.class))).willReturn(testTask);

        // when
        TaskDto.Response response = taskService.createTask(1L, request);

        // then
        assertThat(response).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Test Task");
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("Create task fails when user not found")
    void createTask_UserNotFound() {
        // given
        TaskDto.CreateRequest request = TaskDto.CreateRequest.builder()
                .title("New Task")
                .build();

        given(userRepository.findById(999L)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> taskService.createTask(999L, request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("Get task successfully")
    void getTask() {
        // given
        given(taskRepository.findById(1L)).willReturn(Optional.of(testTask));

        // when
        TaskDto.Response response = taskService.getTask(1L);

        // then
        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getTitle()).isEqualTo("Test Task");
    }

    @Test
    @DisplayName("Complete task successfully")
    void completeTask() {
        // given
        given(taskRepository.findById(1L)).willReturn(Optional.of(testTask));

        // when
        TaskDto.Response response = taskService.completeTask(1L);

        // then
        assertThat(testTask.getIsCompleted()).isTrue();
        assertThat(testTask.getCompletedAt()).isNotNull();
    }

    @Test
    @DisplayName("Complete recurring task creates next task")
    void completeRecurringTask() {
        // given
        Task recurringTask = Task.builder()
                .id(1L)
                .user(testUser)
                .title("Recurring Task")
                .dueDate(LocalDate.now())
                .isCompleted(false)
                .isRecurring(true)
                .recurrenceType(RecurrenceType.DAILY)
                .recurrenceInterval(1)
                .build();

        given(taskRepository.findById(1L)).willReturn(Optional.of(recurringTask));
        given(taskRepository.save(any(Task.class))).willReturn(recurringTask);

        // when
        taskService.completeTask(1L);

        // then
        assertThat(recurringTask.getIsCompleted()).isTrue();
        // verify next task is created
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("Get all tasks for user")
    void getAllTasks() {
        // given
        List<Task> tasks = List.of(testTask);
        given(taskRepository.findByUserIdOrderByCreatedAtDesc(1L)).willReturn(tasks);

        // when
        List<TaskDto.ListResponse> response = taskService.getAllTasks(1L);

        // then
        assertThat(response).hasSize(1);
        assertThat(response.get(0).getTitle()).isEqualTo("Test Task");
    }

    @Test
    @DisplayName("Delete task successfully")
    void deleteTask() {
        // given
        given(taskRepository.findById(1L)).willReturn(Optional.of(testTask));

        // when
        taskService.deleteTask(1L);

        // then
        verify(taskRepository).delete(testTask);
    }
}
