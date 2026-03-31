package com.sfourtraders.api.dto.common;

/**
 * Standard API error response
 */
public class ErrorResponse {
    private String code;
    private String message;
    private String field;
    private Long timestamp;

    public ErrorResponse() {}

    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }

    public ErrorResponse(String code, String message, String field) {
        this.code = code;
        this.message = message;
        this.field = field;
        this.timestamp = System.currentTimeMillis();
    }

    // Getters and Setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getField() { return field; }
    public void setField(String field) { this.field = field; }

    public Long getTimestamp() { return timestamp; }
    public void setTimestamp(Long timestamp) { this.timestamp = timestamp; }
}
