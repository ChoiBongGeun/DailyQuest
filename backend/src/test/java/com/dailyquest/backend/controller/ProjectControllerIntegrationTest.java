package com.dailyquest.backend.controller;

import com.dailyquest.backend.config.jwt.JwtTokenProvider;
import com.dailyquest.backend.domain.*;
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

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class ProjectControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtTokenProvider jwtTokenProvider;

    private Project ownerProject;
    private Project anotherProject;
    private ProjectMember ownerMembership;
    private String ownerToken;
    private String otherUserToken;
    private String viewerToken;

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

        User viewerUser = userRepository.save(User.builder()
                .email("viewer-project@test.com")
                .password(passwordEncoder.encode("password123"))
                .nickname("viewer")
                .build());

        userRepository.save(User.builder()
                .email("member-project@test.com")
                .password(passwordEncoder.encode("password123"))
                .nickname("member")
                .build());

        ownerProject = projectRepository.save(Project.builder()
                .user(owner)
                .name("Owner Project")
                .color("#3B82F6")
                .build());

        anotherProject = projectRepository.save(Project.builder()
                .user(owner)
                .name("Another Project")
                .color("#EF4444")
                .build());

        ownerMembership = projectMemberRepository.save(ProjectMember.builder()
                .project(ownerProject)
                .user(owner)
                .role(ProjectRole.OWNER)
                .build());

        projectMemberRepository.save(ProjectMember.builder()
                .project(ownerProject)
                .user(viewerUser)
                .role(ProjectRole.VIEWER)
                .build());

        ownerToken = jwtTokenProvider.createToken(owner.getId(), owner.getEmail());
        otherUserToken = jwtTokenProvider.createToken(otherUser.getId(), otherUser.getEmail());
        viewerToken = jwtTokenProvider.createToken(viewerUser.getId(), viewerUser.getEmail());
    }

    @Test
    @DisplayName("GET /api/projects/{projectId} - 프로젝트 멤버가 아닌 사용자는 403")
    void getProject_Forbidden_WhenNotMember() throws Exception {
        mockMvc.perform(get("/api/projects/{projectId}", ownerProject.getId())
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.code").value(403001));
    }

    @Test
    @DisplayName("POST /api/projects/{projectId}/members - 공유된 멤버는 프로젝트에 접근 가능")
    void shareProject_AllowsMemberAccess() throws Exception {
        mockMvc.perform(post("/api/projects/{projectId}/members", ownerProject.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "other-project@test.com",
                                  "role": "MEMBER"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("MEMBER"));

        mockMvc.perform(get("/api/projects/{projectId}", ownerProject.getId())
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(ownerProject.getId()))
                .andExpect(jsonPath("$.data.currentUserRole").value("MEMBER"));
    }

    @Test
    @DisplayName("GET /api/projects/{projectId}/members - VIEWER는 모든 멤버 이메일이 null로 반환")
    void getProjectMembers_HidesEmail_ForViewer() throws Exception {
        mockMvc.perform(get("/api/projects/{projectId}/members", ownerProject.getId())
                        .header("Authorization", "Bearer " + viewerToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[*].email", everyItem(nullValue())));
    }

    @Test
    @DisplayName("POST /api/projects/{projectId}/members - VIEWER 역할은 멤버 추가 불가 (403)")
    void shareProject_Forbidden_ForViewer() throws Exception {
        mockMvc.perform(post("/api/projects/{projectId}/members", ownerProject.getId())
                        .header("Authorization", "Bearer " + viewerToken)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "other-project@test.com",
                                  "role": "MEMBER"
                                }
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403001));
    }

    @Test
    @DisplayName("POST /api/projects/{projectId}/members - OWNER 역할 할당 시도 시 400")
    void shareProject_BadRequest_AssignOwnerRole() throws Exception {
        mockMvc.perform(post("/api/projects/{projectId}/members", ownerProject.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "other-project@test.com",
                                  "role": "OWNER"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value(400002));
    }

    @Test
    @DisplayName("POST /api/projects/{projectId}/members - 이미 멤버인 사용자 추가 시 409")
    void shareProject_Conflict_DuplicateMember() throws Exception {
        mockMvc.perform(post("/api/projects/{projectId}/members", ownerProject.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "viewer-project@test.com",
                                  "role": "MEMBER"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409003));
    }

    @Test
    @DisplayName("POST /api/projects/{projectId}/members - owner cannot be re-added as a member")
    void shareProject_Conflict_OwnerSelfInvite() throws Exception {
        mockMvc.perform(post("/api/projects/{projectId}/members", ownerProject.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "owner-project@test.com",
                                  "role": "MEMBER"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value(409003));
    }

    @Test
    @DisplayName("PATCH /api/projects/{projectId}/members/{memberId} - 다른 프로젝트의 memberId 사용 시 404 (IDOR 방지)")
    void updateMemberRole_NotFound_ForOtherProjectMember() throws Exception {
        User anotherMemberUser = userRepository.findByEmail("other-project@test.com").orElseThrow();
        ProjectMember anotherProjectMember = projectMemberRepository.save(ProjectMember.builder()
                .project(anotherProject)
                .user(anotherMemberUser)
                .role(ProjectRole.MEMBER)
                .build());

        mockMvc.perform(patch("/api/projects/{projectId}/members/{memberId}",
                        ownerProject.getId(), anotherProjectMember.getId())
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(APPLICATION_JSON)
                        .content("""
                                {
                                  "role": "ADMIN"
                                }
                                """))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /api/projects/{projectId}/members/{memberId} - OWNER 멤버 제거 시도 시 403")
    void removeMember_Forbidden_ForOwnerMember() throws Exception {
        mockMvc.perform(delete("/api/projects/{projectId}/members/{memberId}",
                        ownerProject.getId(), ownerMembership.getId())
                        .header("Authorization", "Bearer " + ownerToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value(403001));
    }
}
