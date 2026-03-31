package com.sfourtraders.config;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.shared.exception.AuthenticationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

/**
 * JWT authentication filter with proper error handling
 */
@Component
public class JwtFilter extends OncePerRequestFilter {
    private static final Logger LOG = ApplicationLogger.getLogger(JwtFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
                                   @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
                LOG.debug("Missing or invalid Authorization header from {}", request.getRemoteAddr());
                filterChain.doFilter(request, response);
                return;
            }

            String token = authHeader.substring(BEARER_PREFIX.length());

            // Validate token
            if (!jwtUtil.validateToken(token)) {
                LOG.warn("Invalid JWT token from {}", request.getRemoteAddr());
                throw new AuthenticationException.InvalidToken();
            }

            // Extract username and set as request attribute for downstream processing
            String username = jwtUtil.extractUsername(token);
            request.setAttribute("user", username);

            LOG.debug("JWT validation successful for user: {}", username);
            filterChain.doFilter(request, response);

        } catch (AuthenticationException ex) {
            LOG.warn("Authentication filter error: {}", ex.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"AUTH_FAILED\",\"message\":\"" + ex.getMessage() + "\"}");
        } catch (Exception ex) {
            LOG.error("Unexpected error in JWT filter: {}", ex.getMessage(), ex);
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write("{\"code\":\"INTERNAL_ERROR\",\"message\":\"Internal server error\"}");
        }
    }
}
