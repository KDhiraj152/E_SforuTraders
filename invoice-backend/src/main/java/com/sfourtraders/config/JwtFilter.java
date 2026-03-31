package com.sfourtraders.config;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.shared.exception.AuthenticationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * JWT authentication filter with proper error handling
 */
@Component
public class JwtFilter extends OncePerRequestFilter {
    private static final Logger logger = ApplicationLogger.getLogger(JwtFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                logger.debug("Missing or invalid Authorization header from {}", request.getRemoteAddr());
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(BEARER_PREFIX.length());

            // Validate token
            if (!jwtUtil.validateToken(token)) {
                logger.warn("Invalid JWT token from {}", request.getRemoteAddr());
                throw new AuthenticationException.InvalidToken();
            }

            // Extract username and set as request attribute for downstream processing
            String username = jwtUtil.extractUsername(token);
            request.setAttribute("user", username);

            logger.debug("JWT validation successful for user: {}", username);
            filterChain.doFilter(request, response);

        } catch (AuthenticationException ex) {
            logger.warn("Authentication filter error: {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"AUTH_FAILED\",\"message\":\"" + ex.getMessage() + "\"}");
        } catch (Exception ex) {
            logger.error("Unexpected error in JWT filter: {}", ex.getMessage(), ex);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"INTERNAL_ERROR\",\"message\":\"Internal server error\"}");
        }
    }
}
