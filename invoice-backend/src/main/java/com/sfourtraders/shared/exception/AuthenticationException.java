package com.sfourtraders.shared.exception;

import org.springframework.http.HttpStatus;

/**
 * Exceptions for authentication and authorization failures
 */
public class AuthenticationException extends DomainException {
    
    public AuthenticationException(String message) {
        super(message, "AUTH_FAILED", HttpStatus.UNAUTHORIZED.value());
    }

    public static class InvalidCredentials extends AuthenticationException {
        public InvalidCredentials() {
            super("Invalid username or password");
        }
    }

    public static class TokenExpired extends AuthenticationException {
        public TokenExpired() {
            super("JWT token has expired");
        }
    }

    public static class InvalidToken extends AuthenticationException {
        public InvalidToken() {
            super("Invalid or malformed JWT token");
        }
    }

    public static class MissingToken extends AuthenticationException {
        public MissingToken() {
            super("Authorization token is missing");
        }
    }
}
