package com.sfourtraders.api.dto.invoice;

/**
 * Invoice item response DTO
 */
public class InvoiceItemResponse {
    private Long id;
    private String description;
    private Double quantity;
    private Double rate;
    private Double value;
    private String hsn;
    private String sac;
    private Double taxRate;

    public InvoiceItemResponse() {}

    public InvoiceItemResponse(String description, Double quantity, Double rate, Double value) {
        this.description = description;
        this.quantity = quantity;
        this.rate = rate;
        this.value = value;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public Double getRate() { return rate; }
    public void setRate(Double rate) { this.rate = rate; }

    public Double getValue() { return value; }
    public void setValue(Double value) { this.value = value; }

    public String getHsn() { return hsn; }
    public void setHsn(String hsn) { this.hsn = hsn; }

    public String getSac() { return sac; }
    public void setSac(String sac) { this.sac = sac; }

    public Double getTaxRate() { return taxRate; }
    public void setTaxRate(Double taxRate) { this.taxRate = taxRate; }
}
