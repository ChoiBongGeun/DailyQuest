package com.dailyquest.backend.controller;

import com.dailyquest.backend.config.jwt.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
class ActuatorSecurityIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Value("${app.monitoring.actuator.username}")
    private String actuatorUsername;

    @Value("${app.monitoring.actuator.password}")
    private String actuatorPassword;

    @Test
    @DisplayName("Actuator health는 공개 접근 가능")
    void actuatorHealthIsPublic() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Actuator metrics는 미인증 접근 차단")
    void actuatorMetricsRejectsAnonymousUsers() throws Exception {
        mockMvc.perform(get("/actuator/metrics"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Actuator metrics는 일반 사용자 JWT 접근 차단")
    void actuatorMetricsRejectsApplicationUserJwt() throws Exception {
        String userToken = jwtTokenProvider.createToken(1L, "user@example.com");

        mockMvc.perform(get("/actuator/metrics")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Actuator metrics는 모니터링 계정 접근 허용")
    void actuatorMetricsAllowsActuatorUser() throws Exception {
        mockMvc.perform(get("/actuator/metrics")
                        .with(httpBasic(actuatorUsername, actuatorPassword)))
                .andExpect(status().isOk());
    }
}
