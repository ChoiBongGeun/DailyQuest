package com.dailyquest.backend.controller;

import com.dailyquest.backend.config.jwt.JwtTokenProvider;
import com.dailyquest.backend.domain.User;
import com.dailyquest.backend.domain.UserRepository;
import com.dailyquest.backend.dto.UserDto;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private User testUser;
    private String accessToken;

    @BeforeEach
    void setUp() {
        testUser = userRepository.save(User.builder()
                .email("test@test.com")
                .password(passwordEncoder.encode("password123"))
                .nickname("tester")
                .build());

        accessToken = jwtTokenProvider.createToken(testUser.getId(), testUser.getEmail());
    }

    @Test
    @DisplayName("POST /api/users/signup - Sign up successfully")
    void signUp() throws Exception {
        UserDto.SignUpRequest request = UserDto.SignUpRequest.builder()
                .email("new@test.com")
                .password("password123")
                .nickname("newuser")
                .build();

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("new@test.com"));
    }

    @Test
    @DisplayName("POST /api/users/signup - Fail with duplicate email")
    void signUp_DuplicateEmail() throws Exception {
        UserDto.SignUpRequest request = UserDto.SignUpRequest.builder()
                .email("test@test.com")
                .password("password123")
                .nickname("newuser")
                .build();

        mockMvc.perform(post("/api/users/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(409001));
    }

    @Test
    @DisplayName("POST /api/users/login - Login successfully")
    void login() throws Exception {
        UserDto.LoginRequest request = UserDto.LoginRequest.builder()
                .email("test@test.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").exists());
    }

    @Test
    @DisplayName("POST /api/users/login - Fail with wrong password")
    void login_WrongPassword() throws Exception {
        UserDto.LoginRequest request = UserDto.LoginRequest.builder()
                .email("test@test.com")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(401001));
    }

    @Test
    @DisplayName("GET /api/users/me - Get my info with token")
    void getMyInfo() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("test@test.com"));
    }

    @Test
    @DisplayName("GET /api/users/me - Fail without token")
    void getMyInfo_Unauthorized() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/users/check-email - Email available")
    void checkEmail_Available() throws Exception {
        mockMvc.perform(get("/api/users/check-email")
                        .param("email", "available@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(false));
    }

    @Test
    @DisplayName("GET /api/users/check-email - Email already in use")
    void checkEmail_AlreadyInUse() throws Exception {
        mockMvc.perform(get("/api/users/check-email")
                        .param("email", "test@test.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(true));
    }
}
