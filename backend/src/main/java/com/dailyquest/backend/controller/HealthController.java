package com.dailyquest.backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Health Check", description = "서버 상태 확인 API")
@RestController
@RequestMapping("/api")
public class HealthController {

    @Operation(
            summary = "서버 상태 확인",
            description = "서버가 정상적으로 동작하는지 확인합니다."
    )
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "DailyQuest Backend is running!");
        response.put("timestamp", LocalDateTime.now());
        response.put("environment", "development");

        Map<String, String> versions = new HashMap<>();
        versions.put("java", System.getProperty("java.version"));
        versions.put("springBoot", "3.5.9");
        response.put("versions", versions);

        return response;
    }
}