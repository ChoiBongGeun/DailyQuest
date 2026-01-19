package com.dailyquest.backend.util;

import com.dailyquest.backend.exception.ErrorCode;
import com.dailyquest.backend.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtil {

    private SecurityUtil() {}

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
        }

        if (authentication.getPrincipal() instanceof Long userId) {
            return userId;
        }

        throw new UnauthorizedException(ErrorCode.UNAUTHORIZED);
    }

    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null 
                && authentication.isAuthenticated() 
                && authentication.getPrincipal() instanceof Long;
    }
}
