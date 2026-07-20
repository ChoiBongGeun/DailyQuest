package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.PasswordResetToken;
import com.dailyquest.backend.domain.PasswordResetTokenRepository;
import com.dailyquest.backend.domain.User;
import com.dailyquest.backend.domain.UserRepository;
import com.dailyquest.backend.dto.UserDto;
import com.dailyquest.backend.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenGenerator passwordResetTokenGenerator;
    private final PasswordResetMailService passwordResetMailService;

    @Value("${app.password-reset.token-expiration-minutes:30}")
    private long passwordResetTokenExpirationMinutes;

    @Transactional
    public UserDto.Response signUp(UserDto.SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateException(ErrorCode.EMAIL_ALREADY_EXISTS, request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .build();

        User savedUser = userRepository.save(user);
        log.info("User signed up: id={}, email={}", savedUser.getId(), savedUser.getEmail());

        return UserDto.Response.from(savedUser);
    }

    public User login(UserDto.LoginRequest request) {
        // 타이밍 공격 방지: 이메일 존재 여부와 관계없이 항상 패스워드 해싱 수행
        var userOptional = userRepository.findByEmail(request.getEmail());

        if (userOptional.isEmpty()) {
            // 더미 해시로 타이밍 일관성 유지
            passwordEncoder.matches(request.getPassword(), "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy");
            throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
        }

        User user = userOptional.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS);
        }

        log.info("User logged in: id={}, email={}", user.getId(), user.getEmail());
        return user;
    }

    public UserDto.Response getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, userId));
        return UserDto.Response.from(user);
    }

    public UserDto.Response getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND));
        return UserDto.Response.from(user);
    }

    @Transactional
    public UserDto.Response updateNickname(Long userId, String nickname) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, userId));

        user.updateNickname(nickname);
        log.info("User nickname updated: id={}", userId);

        return UserDto.Response.from(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, userId));

        if (currentPassword == null || currentPassword.isBlank()
                || newPassword == null || newPassword.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Current password and new password are required");
        }

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }

        user.updatePassword(passwordEncoder.encode(newPassword));
        log.info("User password changed: id={}", userId);
    }

    @Transactional
    public void deleteUser(Long userId, String password) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND, userId));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException(ErrorCode.PASSWORD_MISMATCH);
        }

        userRepository.delete(user);
        log.info("User deleted: id={}", userId);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public void requestPasswordReset(String email) {
        var userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            log.info("Password reset requested for unknown email");
            return;
        }

        User user = userOptional.get();
        String token = passwordResetTokenGenerator.createToken();
        String tokenHash = passwordResetTokenGenerator.hashToken(token);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(LocalDateTime.now().plusMinutes(passwordResetTokenExpirationMinutes))
                .build();

        passwordResetTokenRepository.save(resetToken);
        passwordResetMailService.sendPasswordResetMail(user, token);
        log.info("Password reset mail sent: userId={}", user.getId());
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        String tokenHash = passwordResetTokenGenerator.hashToken(token);
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_INPUT, "Invalid or expired reset token"));

        LocalDateTime now = LocalDateTime.now();
        if (!resetToken.isUsable(now)) {
            throw new BusinessException(ErrorCode.INVALID_INPUT, "Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        user.updatePassword(passwordEncoder.encode(newPassword));
        passwordResetTokenRepository.deleteAllByUser(user);
        log.info("Password reset completed: userId={}", user.getId());
    }
}
