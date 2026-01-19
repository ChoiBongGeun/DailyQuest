package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.User;
import com.dailyquest.backend.domain.UserRepository;
import com.dailyquest.backend.dto.UserDto;
import com.dailyquest.backend.exception.DuplicateException;
import com.dailyquest.backend.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .email("test@test.com")
                .password("encodedPassword")
                .nickname("tester")
                .build();
    }

    @Test
    @DisplayName("Sign up successfully")
    void signUp() {
        // given
        UserDto.SignUpRequest request = UserDto.SignUpRequest.builder()
                .email("new@test.com")
                .password("password123")
                .nickname("newuser")
                .build();

        given(userRepository.existsByEmail("new@test.com")).willReturn(false);
        given(passwordEncoder.encode(anyString())).willReturn("encodedPassword");
        given(userRepository.save(any(User.class))).willReturn(testUser);

        // when
        UserDto.Response response = userService.signUp(request);

        // then
        assertThat(response).isNotNull();
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Sign up fails when email already exists")
    void signUp_EmailExists() {
        // given
        UserDto.SignUpRequest request = UserDto.SignUpRequest.builder()
                .email("test@test.com")
                .password("password123")
                .nickname("newuser")
                .build();

        given(userRepository.existsByEmail("test@test.com")).willReturn(true);

        // when & then
        assertThatThrownBy(() -> userService.signUp(request))
                .isInstanceOf(DuplicateException.class);
    }

    @Test
    @DisplayName("Login successfully")
    void login() {
        // given
        UserDto.LoginRequest request = UserDto.LoginRequest.builder()
                .email("test@test.com")
                .password("password123")
                .build();

        given(userRepository.findByEmail("test@test.com")).willReturn(Optional.of(testUser));
        given(passwordEncoder.matches("password123", "encodedPassword")).willReturn(true);

        // when
        User user = userService.login(request);

        // then
        assertThat(user.getEmail()).isEqualTo("test@test.com");
    }

    @Test
    @DisplayName("Login fails with wrong password")
    void login_WrongPassword() {
        // given
        UserDto.LoginRequest request = UserDto.LoginRequest.builder()
                .email("test@test.com")
                .password("wrongpassword")
                .build();

        given(userRepository.findByEmail("test@test.com")).willReturn(Optional.of(testUser));
        given(passwordEncoder.matches("wrongpassword", "encodedPassword")).willReturn(false);

        // when & then
        assertThatThrownBy(() -> userService.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("Login fails when user not found")
    void login_UserNotFound() {
        // given
        UserDto.LoginRequest request = UserDto.LoginRequest.builder()
                .email("notexist@test.com")
                .password("password123")
                .build();

        given(userRepository.findByEmail("notexist@test.com")).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }

    @Test
    @DisplayName("Update nickname successfully")
    void updateNickname() {
        // given
        given(userRepository.findById(1L)).willReturn(Optional.of(testUser));

        // when
        UserDto.Response response = userService.updateNickname(1L, "newNickname");

        // then
        assertThat(testUser.getNickname()).isEqualTo("newNickname");
    }
}
