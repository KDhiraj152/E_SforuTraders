package com.sfourtraders.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Security infrastructure configuration for password encoding and cryptography
 */
@Configuration
public class SecurityInfrastructureConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt with strength 12 (recommended for best security/performance balance)
        return new BCryptPasswordEncoder(12);
    }
}
