package com.dailyquest.backend.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    // 400xxx - Bad Request
    BAD_REQUEST(400000, HttpStatus.BAD_REQUEST, "Bad request"),
    VALIDATION_FAILED(400001, HttpStatus.BAD_REQUEST, "Validation failed"),
    INVALID_INPUT(400002, HttpStatus.BAD_REQUEST, "Invalid input value"),
    PASSWORD_MISMATCH(400003, HttpStatus.BAD_REQUEST, "Current password does not match"),

    // 401xxx - Unauthorized
    UNAUTHORIZED(401000, HttpStatus.UNAUTHORIZED, "Unauthorized"),
    INVALID_CREDENTIALS(401001, HttpStatus.UNAUTHORIZED, "Invalid email or password"),
    TOKEN_EXPIRED(401002, HttpStatus.UNAUTHORIZED, "Token has expired"),
    INVALID_TOKEN(401003, HttpStatus.UNAUTHORIZED, "Invalid token"),

    // 403xxx - Forbidden
    FORBIDDEN(403000, HttpStatus.FORBIDDEN, "Access denied"),
    NO_PERMISSION(403001, HttpStatus.FORBIDDEN, "You don't have permission"),

    // 404xxx - Not Found
    NOT_FOUND(404000, HttpStatus.NOT_FOUND, "Resource not found"),
    USER_NOT_FOUND(404001, HttpStatus.NOT_FOUND, "User not found"),
    TASK_NOT_FOUND(404002, HttpStatus.NOT_FOUND, "Task not found"),
    PROJECT_NOT_FOUND(404003, HttpStatus.NOT_FOUND, "Project not found"),

    // 409xxx - Conflict
    CONFLICT(409000, HttpStatus.CONFLICT, "Resource conflict"),
    EMAIL_ALREADY_EXISTS(409001, HttpStatus.CONFLICT, "Email already exists"),
    PROJECT_NAME_ALREADY_EXISTS(409002, HttpStatus.CONFLICT, "Project name already exists"),

    // 500xxx - Internal Server Error
    INTERNAL_SERVER_ERROR(500000, HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error");

    private final int code;
    private final HttpStatus httpStatus;
    private final String message;
}
