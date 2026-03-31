package com.sfourtraders.infrastructure.logging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Application logging facade for consistent logging across the application
 */
@Component
public class ApplicationLogger {

    public static Logger getLogger(Class<?> clazz) {
        return LoggerFactory.getLogger(clazz);
    }

    public static void logRequest(Class<?> clazz, String method, String details) {
        Logger logger = getLogger(clazz);
        logger.debug("[REQUEST] {} - {}", method, details);
    }

    public static void logResponse(Class<?> clazz, String method, Object data) {
        Logger logger = getLogger(clazz);
        logger.debug("[RESPONSE] {} - Success", method);
    }

    public static void logError(Class<?> clazz, String method, Exception ex) {
        Logger logger = getLogger(clazz);
        logger.error("[ERROR] {} - {}", method, ex.getMessage(), ex);
    }

    public static void logBusinessEvent(Class<?> clazz, String event, String details) {
        Logger logger = getLogger(clazz);
        logger.info("[BUSINESS_EVENT] {} - {}", event, details);
    }
}
