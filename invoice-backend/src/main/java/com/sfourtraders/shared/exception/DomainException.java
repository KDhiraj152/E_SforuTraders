package com.sfourtraders.shared.exception;

/**
 * Base exception for all domain-level exceptions
 */
public class DomainException extends RuntimeException {
    private final String code;
    private final int httpStatus;

    public DomainException(String message, String code, int httpStatus) {
        super(message);
        this.code = code;
        this.httpStatus = httpStatus;
    }

    public String getCode() {
        return code;
    }

    public int getHttpStatus() {
        return httpStatus;
    }
}
