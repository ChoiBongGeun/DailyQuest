package com.dailyquest.backend.exception;

public class ResourceNotFoundException extends BusinessException {

    public ResourceNotFoundException(ErrorCode errorCode) {
        super(errorCode);
    }

    public ResourceNotFoundException(ErrorCode errorCode, Long id) {
        super(errorCode, errorCode.getMessage() + " (id: " + id + ")");
    }
}
