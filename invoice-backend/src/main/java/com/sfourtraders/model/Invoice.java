package com.sfourtraders.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "invoices")
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String invoiceNo;

    private String invoiceDate;
    private Boolean reverseCharge = false;

    // Transport
    private String vehicleNo;
    private String supplyDate;
    private String placeOfSupply;

    // Billed To
    private String billedName;
    private String billedAddr;
    private String billedPin;
    private String billedCity;
    private String billedState;
    private String billedStateCode;
    private String billedGstin;

    // Shipped To
    private String shippedName;
    private String shippedAddr;
    private String shippedPin;
    private String shippedCity;
    private String shippedState;
    private String shippedStateCode;
    private String shippedGstin;

    // GST Rates
    private Double sgstRate = 0.0;
    private Double cgstRate = 0.0;
    private Double igstRate = 0.0;
    private Double freight = 0.0;

    // Totals
    private Double subtotal = 0.0;
    private Double sgstAmount = 0.0;
    private Double cgstAmount = 0.0;
    private Double igstAmount = 0.0;
    private Double grandTotal = 0.0;

    // EWB
    private String ewbNo;
    private String ewbStatus = "Pending";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    // Items - One invoice has many items
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Invoice() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getInvoiceNo() {
        return invoiceNo;
    }

    public void setInvoiceNo(String invoiceNo) {
        this.invoiceNo = invoiceNo;
    }

    public String getInvoiceDate() {
        return invoiceDate;
    }

    public void setInvoiceDate(String invoiceDate) {
        this.invoiceDate = invoiceDate;
    }

    public Boolean getReverseCharge() {
        return reverseCharge;
    }

    public void setReverseCharge(Boolean reverseCharge) {
        this.reverseCharge = reverseCharge;
    }

    public String getVehicleNo() {
        return vehicleNo;
    }

    public void setVehicleNo(String vehicleNo) {
        this.vehicleNo = vehicleNo;
    }

    public String getSupplyDate() {
        return supplyDate;
    }

    public void setSupplyDate(String supplyDate) {
        this.supplyDate = supplyDate;
    }

    public String getPlaceOfSupply() {
        return placeOfSupply;
    }

    public void setPlaceOfSupply(String placeOfSupply) {
        this.placeOfSupply = placeOfSupply;
    }

    public String getBilledName() {
        return billedName;
    }

    public void setBilledName(String billedName) {
        this.billedName = billedName;
    }

    public String getBilledAddr() {
        return billedAddr;
    }

    public void setBilledAddr(String billedAddr) {
        this.billedAddr = billedAddr;
    }

    public String getBilledPin() {
        return billedPin;
    }

    public void setBilledPin(String billedPin) {
        this.billedPin = billedPin;
    }

    public String getBilledCity() {
        return billedCity;
    }

    public void setBilledCity(String billedCity) {
        this.billedCity = billedCity;
    }

    public String getBilledState() {
        return billedState;
    }

    public void setBilledState(String billedState) {
        this.billedState = billedState;
    }

    public String getBilledStateCode() {
        return billedStateCode;
    }

    public void setBilledStateCode(String billedStateCode) {
        this.billedStateCode = billedStateCode;
    }

    public String getBilledGstin() {
        return billedGstin;
    }

    public void setBilledGstin(String billedGstin) {
        this.billedGstin = billedGstin;
    }

    public String getShippedName() {
        return shippedName;
    }

    public void setShippedName(String shippedName) {
        this.shippedName = shippedName;
    }

    public String getShippedAddr() {
        return shippedAddr;
    }

    public void setShippedAddr(String shippedAddr) {
        this.shippedAddr = shippedAddr;
    }

    public String getShippedPin() {
        return shippedPin;
    }

    public void setShippedPin(String shippedPin) {
        this.shippedPin = shippedPin;
    }

    public String getShippedCity() {
        return shippedCity;
    }

    public void setShippedCity(String shippedCity) {
        this.shippedCity = shippedCity;
    }

    public String getShippedState() {
        return shippedState;
    }

    public void setShippedState(String shippedState) {
        this.shippedState = shippedState;
    }

    public String getShippedStateCode() {
        return shippedStateCode;
    }

    public void setShippedStateCode(String shippedStateCode) {
        this.shippedStateCode = shippedStateCode;
    }

    public String getShippedGstin() {
        return shippedGstin;
    }

    public void setShippedGstin(String shippedGstin) {
        this.shippedGstin = shippedGstin;
    }

    public Double getSgstRate() {
        return sgstRate;
    }

    public void setSgstRate(Double sgstRate) {
        this.sgstRate = sgstRate;
    }

    public Double getCgstRate() {
        return cgstRate;
    }

    public void setCgstRate(Double cgstRate) {
        this.cgstRate = cgstRate;
    }

    public Double getIgstRate() {
        return igstRate;
    }

    public void setIgstRate(Double igstRate) {
        this.igstRate = igstRate;
    }

    public Double getFreight() {
        return freight;
    }

    public void setFreight(Double freight) {
        this.freight = freight;
    }

    public Double getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(Double subtotal) {
        this.subtotal = subtotal;
    }

    public Double getSgstAmount() {
        return sgstAmount;
    }

    public void setSgstAmount(Double sgstAmount) {
        this.sgstAmount = sgstAmount;
    }

    public Double getCgstAmount() {
        return cgstAmount;
    }

    public void setCgstAmount(Double cgstAmount) {
        this.cgstAmount = cgstAmount;
    }

    public Double getIgstAmount() {
        return igstAmount;
    }

    public void setIgstAmount(Double igstAmount) {
        this.igstAmount = igstAmount;
    }

    public Double getGrandTotal() {
        return grandTotal;
    }

    public void setGrandTotal(Double grandTotal) {
        this.grandTotal = grandTotal;
    }

    public String getEwbNo() {
        return ewbNo;
    }

    public void setEwbNo(String ewbNo) {
        this.ewbNo = ewbNo;
    }

    public String getEwbStatus() {
        return ewbStatus;
    }

    public void setEwbStatus(String ewbStatus) {
        this.ewbStatus = ewbStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<InvoiceItem> getItems() {
        return items;
    }

    public void setItems(List<InvoiceItem> items) {
        this.items = items;
    }
}
