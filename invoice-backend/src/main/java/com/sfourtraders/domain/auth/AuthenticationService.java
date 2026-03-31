package com.sfourtraders.domain.auth;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.shared.exception.AuthenticationException;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Authentication service with secure credential handling
 */
@Service
public class AuthenticationService {
    private static final Logger logger = ApplicationLogger.getLogger(AuthenticationService.class);

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Authenticate user with username and password
     * Credentials should be environment-injected, not hard-coded
     */
    public boolean authenticate(String username, String password,
                               String configUsername, String configPassword) {
        try {
            // Timing attack resistance - always compute hash
            boolean usernameMatch = username != null && username.equals(configUsername);
            boolean passwordMatch = password != null && passwordEncoder.matches(password, configPassword);

            if (!usernameMatch || !passwordMatch) {
                logger.warn("Authentication failed for user: {}", username);
                throw new AuthenticationException.InvalidCredentials();
            }

            logger.info("User {} successfully authenticated", username);
            return true;

        } catch (AuthenticationException ex) {
            throw ex;
        } catch (Exception ex) {
            logger.error("Error during authentication: {}", ex.getMessage(), ex);
            throw new AuthenticationException.InvalidCredentials();
        }
    }

    /**
     * Hash password for storage
     */
    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    /**
     * Verify password against hash
     */
    public boolean verifyPassword(String rawPassword, String hash) {
        return passwordEncoder.matches(rawPassword, hash);
    }
}
