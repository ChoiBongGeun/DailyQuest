package com.dailyquest.backend.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

@Slf4j
@Component
public class SlowRequestLoggingFilter extends OncePerRequestFilter {

    private final long slowRequestThresholdMs;

    public SlowRequestLoggingFilter(
            @Value("${app.monitoring.slow-request-threshold-ms:1000}") long slowRequestThresholdMs
    ) {
        this.slowRequestThresholdMs = slowRequestThresholdMs;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getRequestURI().startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long startedAt = System.nanoTime();

        try {
            filterChain.doFilter(request, response);
        } finally {
            long elapsedMs = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - startedAt);

            if (elapsedMs >= slowRequestThresholdMs) {
                log.warn(
                        "Slow API request method={} uri={} status={} durationMs={} thresholdMs={}",
                        request.getMethod(),
                        request.getRequestURI(),
                        response.getStatus(),
                        elapsedMs,
                        slowRequestThresholdMs
                );
            }
        }
    }
}
