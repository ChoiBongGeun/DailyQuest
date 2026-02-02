package com.dailyquest.backend.controller;

import com.dailyquest.backend.dto.ApiResponse;
import com.dailyquest.backend.dto.DashboardDto;
import com.dailyquest.backend.service.DashboardService;
import com.dailyquest.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Dashboard", description = "Dashboard API")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Get dashboard", description = "Get user's task statistics and dashboard data")
    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDto.Response>> getDashboard() {
        Long userId = SecurityUtil.getCurrentUserId();
        DashboardDto.Response response = dashboardService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Get dashboard stats", description = "Get user's task statistics")
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardDto.Response>> getStats() {
        Long userId = SecurityUtil.getCurrentUserId();
        DashboardDto.Response response = dashboardService.getDashboard(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
