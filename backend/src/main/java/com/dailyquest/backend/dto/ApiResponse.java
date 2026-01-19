package com.dailyquest.backend.dto;

import com.dailyquest.backend.exception.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private boolean success;
    private Integer code;
    private String message;
    private T data;

    // Success responses
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static ApiResponse<Void> success(String message) {
        return ApiResponse.<Void>builder()
                .success(true)
                .message(message)
                .build();
    }

    // Error responses with ErrorCode
    public static ApiResponse<Void> error(ErrorCode errorCode) {
        return ApiResponse.<Void>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();
    }

    public static ApiResponse<Void> error(ErrorCode errorCode, String message) {
        return ApiResponse.<Void>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode, T data) {
        return ApiResponse.<T>builder()
                .success(false)
                .code(errorCode.getCode())
                .message(errorCode.getMessage())
                .data(data)
                .build();
    }
}
