package com.dailyquest.backend.controller;

import com.dailyquest.backend.config.jwt.JwtTokenProvider;
import com.dailyquest.backend.domain.Project;
import com.dailyquest.backend.domain.ProjectRepository;
import com.dailyquest.backend.domain.User;
import com.dailyquest.backend.domain.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProjectControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    private Project ownerProject;
    private String otherUserToken;

    @BeforeEach
    void setUp() {
        User owner = userRepository.save(User.builder()
                .email("owner-project@test.com")
                .password(passwordEncoder.encode("password123"))
                .nickname("owner")
                .build());

        User otherUser = userRepository.save(User.builder()
                .email("other-project@test.com")
                .password(passwordEncoder.encode("password123"))
                .nickname("other")
                .build());

        ownerProject = projectRepository.save(Project.builder()
                .user(owner)
                .name("Owner Project")
                .color("#3B82F6")
                .build());

        otherUserToken = jwtTokenProvider.createToken(otherUser.getId(), otherUser.getEmail());
    }

    @Test
    @DisplayName("GET /api/projects/{projectId} - Fail with forbidden when project owner is different")
    void getProject_Forbidden_WhenNotOwner() throws Exception {
        mockMvc.perform(get("/api/projects/{projectId}", ownerProject.getId())
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(403001));
    }
}
