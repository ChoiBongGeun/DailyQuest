package com.dailyquest.backend.controller;

import com.dailyquest.backend.config.jwt.JwtTokenProvider;
import com.dailyquest.backend.dto.ApiResponse;
import com.dailyquest.backend.dto.UserDto;
import com.dailyquest.backend.service.UserService;
import com.dailyquest.backend.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "User", description = "User Management API")
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    @Operation(summary = "Sign up", description = "Register a new user")
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<UserDto.Response>> signUp(
            @Valid @RequestBody UserDto.SignUpRequest request) {
        UserDto.Response response = userService.signUp(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Sign up successful", response));
    }

    @Operation(summary = "Login", description = "Login with email and password")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<UserDto.LoginResponse>> login(
            @Valid @RequestBody UserDto.LoginRequest request) {
        var user = userService.login(request);
        String token = jwtTokenProvider.createToken(user.getId(), user.getEmail());
        
        UserDto.LoginResponse response = UserDto.LoginResponse.of(user, token);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @Operation(summary = "Get my info", description = "Get current user's information",
               security = @SecurityRequirement(name = "bearerAuth"))
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDto.Response>> getMyInfo() {
        Long userId = SecurityUtil.getCurrentUserId();
        UserDto.Response response = userService.getUser(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @Operation(summary = "Update nickname", description = "Update user's nickname",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/me/nickname")
    public ResponseEntity<ApiResponse<UserDto.Response>> updateNickname(
            @Valid @RequestBody UserDto.NicknameRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        UserDto.Response response = userService.updateNickname(userId, request.getNickname());
        return ResponseEntity.ok(ApiResponse.success("Nickname updated successfully", response));
    }

    @Operation(summary = "Change password", description = "Change user's password",
               security = @SecurityRequirement(name = "bearerAuth"))
    @PatchMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody UserDto.UpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        userService.changePassword(userId, request.getCurrentPassword(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    @Operation(summary = "Delete account", description = "Delete user account",
               security = @SecurityRequirement(name = "bearerAuth"))
    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Valid @RequestBody UserDto.DeleteRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();
        userService.deleteUser(userId, request.getPassword());
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully"));
    }

    @Operation(summary = "Check email availability", description = "Check if email is available")
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Boolean>> checkEmailExists(@RequestParam String email) {
        boolean exists = userService.existsByEmail(email);
        if (exists) {
            return ResponseEntity.ok(ApiResponse.success("Email already in use", true));
        }
        return ResponseEntity.ok(ApiResponse.success("Email available", false));
    }
}
