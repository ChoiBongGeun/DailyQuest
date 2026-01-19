package com.dailyquest.backend.exception;

public class UnauthorizedException extends BusinessException {

    public UnauthorizedException() {
        super(ErrorCode.UNAUTHORIZED);
    }

    public UnauthorizedException(ErrorCode errorCode) {
        super(errorCode);
    }
}
