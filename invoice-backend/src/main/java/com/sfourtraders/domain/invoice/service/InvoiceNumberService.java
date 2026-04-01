package com.sfourtraders.domain.invoice.service;

import com.sfourtraders.infrastructure.logging.ApplicationLogger;
import com.sfourtraders.repository.InvoiceRepository;
import org.slf4j.Logger;
import org.springframework.stereotype.Service;
import java.time.Year;

/**
 * Domain service for invoice number generation using persisted sequence state
 */
@Service
public class InvoiceNumberService {
    private static final Logger logger = ApplicationLogger.getLogger(InvoiceNumberService.class);
    private static final String INVOICE_PREFIX = "INV";

    private final InvoiceRepository invoiceRepository;

    public InvoiceNumberService(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    /**
     * Generate next invoice number in sequence: INV-YYYY-###
     */
    public String generateNextInvoiceNumber() {
        int year = Year.now().getValue();
        int nextSequence = invoiceRepository.findMaxSequenceForYear(String.valueOf(year)) + 1;
        String nextNumber = String.format("%s-%d-%03d", INVOICE_PREFIX, year, nextSequence);

        logger.debug("Generated next invoice number: {}", nextNumber);
        return nextNumber;
    }
}
