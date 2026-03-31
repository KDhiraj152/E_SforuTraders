package com.sfourtraders.api.controller;

import com.sfourtraders.api.dto.auth.LoginRequest;
import com.sfourtraders.api.dto.auth.LoginResponse;
import com.sfourtraders.config.JwtUtil;
import com.sfourtraders.domain.auth.AuthenticationService;
import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.shared.exception.AuthenticationException;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Authentication controller with secure credential handling
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${allowed.origins}")
public class AuthController {
    private static final Logger logger = ApplicationLogger.getLogger(AuthController.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationService authenticationService;

    @Value("${app.username}")
    private String appUsername;

    @Value("${app.password}")
    private String appPassword;

    /**
     * Login endpoint with validated request body
     * @param request Login credentials (username and password)
     * @return JWT token on successful authentication
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            ApplicationLogger.logRequest(AuthController.class, "login", request.getUsername());

            // Authenticate user
            authenticationService.authenticate(request.getUsername(), request.getPassword(),
                    appUsername, appPassword);

            // Generate JWT token
            String token = jwtUtil.generateToken(request.getUsername());

            ApplicationLogger.logResponse(AuthController.class, "login", request.getUsername());

            return ResponseEntity.ok(new LoginResponse(
                    token,
                    request.getUsername(),
                    "Login successful"
            ));
        } catch (AuthenticationException ex) {
            logger.warn("Login attempt failed for user: {}", request.getUsername());
            throw ex;
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Authentication service is healthy");
    }
}
