package com.sfourtraders.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Exceptions for validation failures
 */
public class ValidationException extends DomainException {
    private final String field;

    public ValidationException(String field, String message) {
        super(message, "VALIDATION_FAILED", HttpStatus.BAD_REQUEST.value());
        this.field = field;
    }

    public String getField() {
        return field;
    }
}
