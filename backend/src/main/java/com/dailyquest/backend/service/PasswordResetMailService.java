package com.dailyquest.backend.service;

import com.dailyquest.backend.domain.User;
import com.dailyquest.backend.exception.BusinessException;
import com.dailyquest.backend.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PasswordResetMailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${app.mail.from}")
    private String fromAddress;

    public void sendPasswordResetMail(User user, String token) {
        String resetUrl = frontendUrl + "/reset-password?token=" + token;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("[DailyQuest] Password reset");
        message.setText("""
                Hello %s,

                Use the link below to reset your DailyQuest password.
                This link expires in 30 minutes.

                %s

                If you did not request this, you can ignore this email.
                """.formatted(user.getNickname(), resetUrl));

        try {
            mailSender.send(message);
        } catch (MailException e) {
            throw new BusinessException(
                    ErrorCode.MAIL_DELIVERY_FAILED,
                    "Mail server is unavailable. Start Mailpit at localhost:1025 and try again."
            );
        }
    }
}
