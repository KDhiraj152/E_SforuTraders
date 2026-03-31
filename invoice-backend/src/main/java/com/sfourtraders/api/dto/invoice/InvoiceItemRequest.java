package com.sfourtraders.api.dto.invoice;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Invoice item request DTO
 */
public class InvoiceItemRequest {

    @NotBlank(message = "Item description is required")
    private String description;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be positive")
    private Double quantity;

    @NotNull(message = "Rate is required")
    @Min(value = 0, message = "Rate must be positive")
    private Double rate;

    private String hsn;
    private String sac;
    private Double taxRate = 0.0;

    public InvoiceItemRequest() {}

    public InvoiceItemRequest(String description, Double quantity, Double rate) {
        this.description = description;
        this.quantity = quantity;
        this.rate = rate;
    }

    // Getters and Setters
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public String getHsn() { return hsn; }
    public void setHsn(String hsn) { this.hsn = hsn; }

    public String getSac() { return sac; }
    public void setSac(String sac) { this.sac = sac; }

    public Double getTaxRate() { return taxRate; }
    public void setTaxRate(Double taxRate) { this.taxRate = taxRate; }
}
