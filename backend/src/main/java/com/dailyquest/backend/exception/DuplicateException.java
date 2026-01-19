package com.dailyquest.backend.exception;

public class DuplicateException extends BusinessException {

    public DuplicateException(ErrorCode errorCode) {
        super(errorCode);
    }

    public DuplicateException(ErrorCode errorCode, String value) {
        super(errorCode, errorCode.getMessage() + " (" + value + ")");
    }
}
