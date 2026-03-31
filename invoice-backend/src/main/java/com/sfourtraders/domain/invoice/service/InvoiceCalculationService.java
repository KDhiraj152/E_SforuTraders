package com.sfourtraders.domain.invoice.service;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.model.Invoice;
import com.sfourtraders.model.InvoiceItem;
import com.sfourtraders.shared.exception.ValidationException;
import org.slf4j.Logger;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * Domain service for invoice calculations and validations
 */
@Service
public class InvoiceCalculationService {
    private static final Logger logger = ApplicationLogger.getLogger(InvoiceCalculationService.class);

    /**
     * Calculate subtotal from items
     */
    public Double calculateSubtotal(List<InvoiceItem> items) {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }

        Double subtotal = items.stream()
                .mapToDouble(item -> {
                    Double quantity = item.getQuantity() != null ? item.getQuantity() : 0;
                    Double rate = item.getRate() != null ? item.getRate() : 0;
                    return quantity * rate;
                })
                .sum();

        logger.debug("Calculated subtotal: {}", subtotal);
        return Math.max(0, subtotal);
    }

    /**
     * Calculate GST amount
     */
    public Double calculateGstAmount(Double subtotal, Double gstRate) {
        if (subtotal == null || subtotal < 0 || gstRate == null || gstRate < 0 || gstRate > 100) {
            return 0.0;
        }
        return subtotal * (gstRate / 100.0);
    }

    /**
     *  Calculate grand total
     */
    public Double calculateGrandTotal(Double subtotal, Double sgst, Double cgst, Double igst, Double freight) {
        if (subtotal == null) subtotal = 0.0;
        if (sgst == null) sgst = 0.0;
        if (cgst == null) cgst = 0.0;
        if (igst == null) igst = 0.0;
        if (freight == null) freight = 0.0;

        Double total = subtotal + sgst + cgst + igst + freight;
        return Math.max(0, total);
    }

    /**
     * Validate invoice data
     */
    public void validateInvoiceData(Invoice invoice) {
        if (invoice.getBilledName() == null || invoice.getBilledName().trim().isEmpty()) {
            throw new ValidationException("billedName", "Billed party name is required");
        }

        if (invoice.getItems() == null || invoice.getItems().isEmpty()) {
            throw new ValidationException("items", "Invoice must have at least one item");
        }

        for (InvoiceItem item : invoice.getItems()) {
            if (item.getDescription() == null || item.getDescription().trim().isEmpty()) {
                throw new ValidationException("description", "Item description is required");
            }
            if (item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new ValidationException("quantity", "Item quantity must be positive");
            }
            if (item.getRate() == null || item.getRate() < 0) {
                throw new ValidationException("rate", "Item rate cannot be negative");
            }
        }

        logger.debug("Invoice validation passed");
    }
}
