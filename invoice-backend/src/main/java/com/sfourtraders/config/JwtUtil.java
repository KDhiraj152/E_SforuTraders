package com.sfourtraders.config;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.shared.exception.AuthenticationException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.security.Key;
import java.util.Date;

/**
 * Secure JWT utility with proper error handling and validation
 */
@Component
public class JwtUtil {
    private static final Logger logger = ApplicationLogger.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    /**
     * Get signing key from secret (validates key length for HS256)
     */
    private Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        if (keyBytes.length < 32) {
            logger.warn("JWT secret is too short (< 32 bytes). Minimum 256 bits required for HS256");
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Generate JWT token with username
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Extract username from token
     */
    public String extractUsername(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getSubject();
        } catch (ExpiredJwtException e) {
            logger.debug("Token expired: {}", e.getMessage(), e);
            throw new AuthenticationException.TokenExpired();
        } catch (SignatureException e) {
            logger.debug("Invalid token signature: {}", e.getMessage(), e);
            throw new AuthenticationException.InvalidToken();
        } catch (MalformedJwtException e) {
            logger.debug("Malformed JWT: {}", e.getMessage(), e);
            throw new AuthenticationException.InvalidToken();
        } catch (JwtException e) {
            logger.debug("JWT parsing error: {}", e.getMessage(), e);
            throw new AuthenticationException.InvalidToken();
        }
    }

    /**
     * Validate token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            logger.debug("Token expired: {}", e.getMessage(), e);
            throw new AuthenticationException.TokenExpired();
        } catch (JwtException e) {
            logger.debug("Invalid token: {}", e.getMessage(), e);
            throw new AuthenticationException.InvalidToken();
        }
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            Date tokenExpiration = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .getExpiration();
            return tokenExpiration.before(new Date());
        } catch (JwtException e) {
            logger.debug("Unable to evaluate token expiration: {}", e.getMessage(), e);
            return true;
        }
    }
}
