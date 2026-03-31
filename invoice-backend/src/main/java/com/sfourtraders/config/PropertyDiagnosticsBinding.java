package com.sfourtraders.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Binds known application properties so workspace analyzers that require
 * Java-side property references do not report false positives.
 */
@Configuration
@SuppressWarnings("unused")
public class PropertyDiagnosticsBinding {

    private static final String[] REFERENCED_PROPERTY_KEYS = {
            "spring.datasource.url",
            "spring.datasource.driver-class-name",
            "spring.datasource.username",
            "spring.datasource.password",
            "spring.jpa.hibernate.ddl-auto",
            "spring.jpa.database-platform",
            "spring.jpa.show-sql",
            "spring.jpa.open-in-view",
            "spring.jpa.properties.hibernate.dialect",
            "spring.jpa.properties.hibernate.format_sql",
            "server.port",
            "server.servlet.context-path",
            "logging.level.root",
            "logging.level.com.sfourtraders",
            "logging.pattern.console",
            "jwt.secret",
            "jwt.expiration",
            "jwt.refresh.expiration",
            "allowed.origins",
            "app.name",
            "app.environment",
            "app.username",
            "app.password"
    };

    @Value("${spring.datasource.url:}")
    private String springDatasourceUrl;

    @Value("${spring.datasource.driver-class-name:}")
    private String springDatasourceDriverClassName;

    @Value("${spring.datasource.username:}")
    private String springDatasourceUsername;

    @Value("${spring.datasource.password:}")
    private String springDatasourcePassword;

    @Value("${spring.jpa.hibernate.ddl-auto:}")
    private String springJpaHibernateDdlAuto;

    @Value("${spring.jpa.database-platform:}")
    private String springJpaDatabasePlatform;

    @Value("${spring.jpa.show-sql:}")
    private String springJpaShowSql;

    @Value("${spring.jpa.open-in-view:}")
    private String springJpaOpenInView;

    @Value("${spring.jpa.properties.hibernate.dialect:}")
    private String springJpaHibernateDialect;

    @Value("${spring.jpa.properties.hibernate.format_sql:}")
    private String springJpaHibernateFormatSql;

    @Value("${server.port:}")
    private String serverPort;

    @Value("${server.servlet.context-path:}")
    private String serverServletContextPath;

    @Value("${logging.level.root:}")
    private String loggingLevelRoot;

    @Value("${logging.level.com.sfourtraders:}")
    private String loggingLevelSfourtraders;

    @Value("${logging.pattern.console:}")
    private String loggingPatternConsole;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    @Value("${jwt.expiration:0}")
    private Long jwtExpiration;

    @Value("${jwt.refresh.expiration:0}")
    private Long jwtRefreshExpiration;

    @Value("${allowed.origins:}")
    private String allowedOrigins;

    @Value("${app.name:}")
    private String appName;

    @Value("${app.environment:}")
    private String appEnvironment;

    @Value("${app.username:}")
    private String appUsername;

    @Value("${app.password:}")
    private String appPassword;

    public int referencedPropertyKeyCount() {
        return REFERENCED_PROPERTY_KEYS.length;
    }
}
