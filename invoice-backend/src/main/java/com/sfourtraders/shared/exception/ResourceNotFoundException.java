package com.sfourtraders.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Exceptions for resource not found scenarios
 */
public class ResourceNotFoundException extends DomainException {
    
    public ResourceNotFoundException(String resourceType, Long id) {
        super(
            String.format("%s with ID %d not found", resourceType, id),
            "RESOURCE_NOT_FOUND",
            HttpStatus.NOT_FOUND.value()
        );
    }

    public ResourceNotFoundException(String resourceType, String identifier) {
        super(
            String.format("%s '%s' not found", resourceType, identifier),
            "RESOURCE_NOT_FOUND",
            HttpStatus.NOT_FOUND.value()
        );
    }
}
