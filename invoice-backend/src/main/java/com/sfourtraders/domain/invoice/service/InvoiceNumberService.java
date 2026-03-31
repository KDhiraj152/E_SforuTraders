package com.sfourtraders.domain.invoice.service;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.model.Invoice;
import com.sfourtraders.repository.InvoiceRepository;
import com.sfourtraders.shared.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Year;
import java.util.Optional;

/**
 * Domain service for invoice number generation with concurrency safety
 */
@Service
public class InvoiceNumberService {
    private static final Logger logger = ApplicationLogger.getLogger(InvoiceNumberService.class);
    private static final String INVOICE_PREFIX = "INV";

    @Autowired
    private InvoiceRepository invoiceRepository;

    /**
     * Generate next invoice number in sequence: INV-YYYY-###
     */
    public synchronized String generateNextInvoiceNumber() {
        try {
            int year = Year.now().getValue();
            Optional<Invoice> lastInvoice = invoiceRepository.findLastInvoice();

            String nextNumber;
            if (lastInvoice.isEmpty()) {
                nextNumber = String.format("%s-%d-001", INVOICE_PREFIX, year);
            } else {
                String lastNo = lastInvoice.get().getInvoiceNo();
                nextNumber = incrementInvoiceNumber(lastNo, year);
            }

            logger.debug("Generated next invoice number: {}", nextNumber);
            return nextNumber;

        } catch (Exception ex) {
            logger.error("Error generating invoice number: {}", ex.getMessage(), ex);
            throw new RuntimeException("Failed to generate invoice number", ex);
        }
    }

    /**
     * Increment invoice number, resetting sequence for new year
     */
    private String incrementInvoiceNumber(String lastNo, int currentYear) {
        try {
            String[] parts = lastNo.split("-");
            if (parts.length < 3) {
                return String.format("%s-%d-001", INVOICE_PREFIX, currentYear);
            }

            int lastYear = Integer.parseInt(parts[1]);
            int sequence = Integer.parseInt(parts[2]);

            if (lastYear < currentYear) {
                // New year, reset sequence
                sequence = 1;
            } else if (lastYear == currentYear) {
                sequence++;
            }

            return String.format("%s-%d-%03d", INVOICE_PREFIX, currentYear, sequence);

        } catch (Exception ex) {
            logger.warn("Error parsing invoice number '{}': {}, generating default", lastNo, ex.getMessage());
            return String.format("%s-%d-001", INVOICE_PREFIX, currentYear);
        }
    }
}
