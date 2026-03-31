package com.sfourtraders.api.dto.invoice;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

/**
 * Invoice creation/update request DTO
 */
public class InvoiceRequest {

    private String invoiceNo;

    @NotBlank(message = "Invoice date is required")
    private String invoiceDate;

    private Boolean reverseCharge = false;

    private String vehicleNo;
    private String supplyDate;
    private String placeOfSupply;

    @NotBlank(message = "Billed party name is required")
    private String billedName;
    private String billedAddr;
    private String billedPin;
    private String billedCity;
    private String billedState;
    private String billedStateCode;
    private String billedGstin;

    private String shippedName;
    private String shippedAddr;
    private String shippedPin;
    private String shippedCity;
    private String shippedState;
    private String shippedStateCode;
    private String shippedGstin;

    @Min(value = 0, message = "SGST rate cannot be negative")
    @Max(value = 100, message = "SGST rate cannot exceed 100")
    private Double sgstRate = 0.0;

    @Min(value = 0, message = "CGST rate cannot be negative")
    @Max(value = 100, message = "CGST rate cannot exceed 100")
    private Double cgstRate = 0.0;

    @Min(value = 0, message = "IGST rate cannot be negative")
    @Max(value = 100, message = "IGST rate cannot exceed 100")
    private Double igstRate = 0.0;

    @Min(value = 0, message = "Freight cannot be negative")
    private Double freight = 0.0;

    @Valid
    @NotEmpty(message = "Invoice must have at least one item")
    private List<InvoiceItemRequest> items;

    private String ewbNo;

    // Getters and Setters
    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public String getInvoiceDate() { return invoiceDate; }
    public void setInvoiceDate(String invoiceDate) { this.invoiceDate = invoiceDate; }

    public Boolean getReverseCharge() { return reverseCharge; }
    public void setReverseCharge(Boolean reverseCharge) { this.reverseCharge = reverseCharge; }

    public String getVehicleNo() { return vehicleNo; }
    public void setVehicleNo(String vehicleNo) { this.vehicleNo = vehicleNo; }

    public String getSupplyDate() { return supplyDate; }
    public void setSupplyDate(String supplyDate) { this.supplyDate = supplyDate; }

    public String getPlaceOfSupply() { return placeOfSupply; }
    public void setPlaceOfSupply(String placeOfSupply) { this.placeOfSupply = placeOfSupply; }

    public String getBilledName() { return billedName; }
    public void setBilledName(String billedName) { this.billedName = billedName; }

    public String getBilledAddr() { return billedAddr; }
    public void setBilledAddr(String billedAddr) { this.billedAddr = billedAddr; }

    public String getBilledPin() { return billedPin; }
    public void setBilledPin(String billedPin) { this.billedPin = billedPin; }

    public String getBilledCity() { return billedCity; }
    public void setBilledCity(String billedCity) { this.billedCity = billedCity; }

    public String getBilledState() { return billedState; }
    public void setBilledState(String billedState) { this.billedState = billedState; }

    public String getBilledStateCode() { return billedStateCode; }
    public void setBilledStateCode(String billedStateCode) { this.billedStateCode = billedStateCode; }

    public String getBilledGstin() { return billedGstin; }
    public void setBilledGstin(String billedGstin) { this.billedGstin = billedGstin; }

    public String getShippedName() { return shippedName; }
    public void setShippedName(String shippedName) { this.shippedName = shippedName; }

    public String getShippedAddr() { return shippedAddr; }
    public void setShippedAddr(String shippedAddr) { this.shippedAddr = shippedAddr; }

    public String getShippedPin() { return shippedPin; }
    public void setShippedPin(String shippedPin) { this.shippedPin = shippedPin; }

    public String getShippedCity() { return shippedCity; }
    public void setShippedCity(String shippedCity) { this.shippedCity = shippedCity; }

    public String getShippedState() { return shippedState; }
    public void setShippedState(String shippedState) { this.shippedState = shippedState; }

    public String getShippedStateCode() { return shippedStateCode; }
    public void setShippedStateCode(String shippedStateCode) { this.shippedStateCode = shippedStateCode; }

    public String getShippedGstin() { return shippedGstin; }
    public void setShippedGstin(String shippedGstin) { this.shippedGstin = shippedGstin; }

    public Double getSgstRate() { return sgstRate; }
    public void setSgstRate(Double sgstRate) { this.sgstRate = sgstRate; }

    public Double getCgstRate() { return cgstRate; }
    public void setCgstRate(Double cgstRate) { this.cgstRate = cgstRate; }

    public Double getIgstRate() { return igstRate; }
    public void setIgstRate(Double igstRate) { this.igstRate = igstRate; }

    public Double getFreight() { return freight; }
    public void setFreight(Double freight) { this.freight = freight; }

    public List<InvoiceItemRequest> getItems() { return items; }
    public void setItems(List<InvoiceItemRequest> items) { this.items = items; }

    public String getEwbNo() { return ewbNo; }
    public void setEwbNo(String ewbNo) { this.ewbNo = ewbNo; }
}
