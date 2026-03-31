package com.sfourtraders.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Exceptions for business rule violations
 */
public class BusinessException extends DomainException {
    
    public BusinessException(String message, String code) {
        super(message, code, HttpStatus.BAD_REQUEST.value());
    }
}
